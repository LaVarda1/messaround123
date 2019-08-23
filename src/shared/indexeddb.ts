const dbName = 'webQuakeAssets',
  metaStoreName = 'meta',
  assetStoreName = 'assets',
  dbVersion = 5;

const indexedDb: IDBFactory = window.indexedDB
const gameAndFileIndex = "game, filename"
const gameIndex = "game"

function open (): Promise<IDBDatabase> {
  return new Promise(function(resolve, reject){
    var openReq: IDBOpenDBRequest = indexedDb.open(dbName, dbVersion);
    openReq.onupgradeneeded = function(event: any) {
      var db = event.target.result as IDBDatabase;
      if (event.oldVersion < 4) {
        db.createObjectStore("meta", { autoIncrement: true });
        db.createObjectStore("assets", { keyPath: 'assetId' });
      }
      if (event.oldVersion < 5) {
        var metaStore = openReq.transaction.objectStore("meta");
        metaStore.createIndex(gameIndex, "game", { unique: false });
        metaStore.createIndex(gameAndFileIndex, ["game", "fileName"], { unique: false });
      }
    };
    openReq.onerror = function(event) {
      alert("Why didn't you allow my web app to use IndexedDB?!");
      reject()
    };
    openReq.onsuccess = function(event: any){
      resolve(event.target.result);
    };
  });
}

const promiseMe = (request: IDBRequest) => {
  return new Promise((resolve, reject) =>  {
    request.onerror = function(e) {
      console.log(e);
      reject(e);
    };
    request.onsuccess = function(event) {
      resolve(request.result as any);
    };
  })
}

const dbOperation = async (storeName: string, fn: (db: IDBObjectStore) => IDBRequest): Promise<any> => {
  const db = await open()
  const store = db
    .transaction([storeName], 'readwrite')
    .objectStore(storeName); 

  return new Promise((resolve, reject) =>  {
    const request = fn(store) as IDBRequest;
      
    request.onerror = function(e) {
      console.log(e);
      reject(e);
    };
    request.onsuccess = function(event) {
      resolve(request.result as any);
    };
  })
}

export const getAllMeta = async (): Promise<Array<any>> => {
  const db = await open()

  var transaction = db.transaction(['meta'], 'readonly');
  var meta = transaction.objectStore('meta');

  // Select the first matching record, if any exists, assume game exists
  const allKeys = await promiseMe(meta.getAllKeys()) as any[]
  
  return Promise.all(allKeys.map(async key => {
    const metaObj = await promiseMe(meta.get(key))

    return {
      ...metaObj,
      assetId: key
    }
  }))
}


export const getAllMetaPerGame = async (game): Promise<Array<any>> => {
  const assetMetas = await getAllMeta()
  return assetMetas.filter(meta => meta.game === game.toLowerCase())
}

export const getAllAssets = async () => {
  return dbOperation(assetStoreName, store => store.getAll())
}

export const getAllAssetsPerGame = async (game) => {
  const assetMetas = await getAllMetaPerGame(game)
  
  return Promise.all(assetMetas.map(async assetMeta => {
    const asset = await dbOperation(assetStoreName, store => store.get(assetMeta.assetId))
    return {
      ...assetMeta,
      ...asset
    }
  }))
}

export const getAsset = async (game, fileName) => {
  const db = await open()

  var transaction = db.transaction(['assets', 'meta'], 'readonly');
  var meta = transaction.objectStore('meta');
  var assets = transaction.objectStore('assets');
  var index = meta.index(gameAndFileIndex);

  // Select the first matching record
  const assetMeta = await promiseMe(index.get(IDBKeyRange.only([game.toLowerCase(), fileName.toLowerCase()]))) as any
  if (assetMeta) {
    const assetId = await promiseMe(index.getKey(IDBKeyRange.only([game.toLowerCase(), fileName.toLowerCase()]))) as any
    return {
      ...assetMeta,
      ...(await promiseMe(assets.get(assetId)))
    }
  }
  return null
} 

export const saveAsset = async (game: string, fileName: string, fileCount: number, blob: any) => {
  if (!game || !fileName || blob.length <= 0) {
    throw new Error('Missing data while trying to save asset')
  }
  const metaObj = {
    game: game.toLowerCase(),
    fileName: fileName.toLowerCase(),
    fileCount
  }
  const assetId = await dbOperation(metaStoreName, store => store.put(metaObj))
  await dbOperation(assetStoreName, store => store.put({data: blob, assetId}))
  return assetId
}

export const removeAsset = async (assetId): Promise<void> => {
  await dbOperation(metaStoreName, store => store.delete(assetId))
  return await dbOperation(assetStoreName, store => store.delete(assetId))
}

export const hasGame = async (game) => {
  const db = await open()

  var transaction = db.transaction(['meta'], 'readonly');
  var meta = transaction.objectStore('meta');
  var index = meta.index(gameIndex);

  // Select the first matching record, if any exists, assume game exists
  const assetMeta = await promiseMe(index.get(IDBKeyRange.only(game.toLowerCase()))) as any
  return !!assetMeta
}

export const removeGame = async (game) => {
  const db = await open()

  var transaction = db.transaction([metaStoreName, assetStoreName], 'readwrite')
  var metas = transaction.objectStore(metaStoreName)
  var assets = transaction.objectStore(assetStoreName)
  var metaGameIndex = metas.index(gameIndex)

  const assetMetaKeys = await promiseMe(metaGameIndex.getAllKeys(IDBKeyRange.only(game.toLowerCase()))) as any

  return Promise.all(assetMetaKeys.map(key =>
    Promise.all([
      promiseMe(assets.delete(key)),
      promiseMe(metas.delete(key))
    ])
  ))
}

