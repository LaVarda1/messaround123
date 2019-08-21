import * as draw from '../../engine/draw'
import * as q from '../../engine/q'
import * as crc from '../../engine/crc'
import * as com from '../../engine/com'
import * as sys from '../../engine/sys'
import * as con from '../../engine/console'
import * as indexeddb from './indexeddb'
import IPackedFile from '../../engine/interfaces/store/IPackedFile'


function getBinarySize (url) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, true); // Notice "HEAD" instead of "GET",
                                 //  to get only the header
    xhr.onreadystatechange = function() {
      if (this.readyState == this.DONE) {
        return xhr.status === 200 
          ? resolve(xhr.getResponseHeader("Content-Length"))
          : reject(xhr.status)
      }
    };
    xhr.onerror = reject
    xhr.send();
  })
}

const getFileWithProgress = (url, progress) : Promise<any> => {
  return getBinarySize(url)
    .then(total => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.overrideMimeType('text\/plain; charset=x-user-defined')
        xhr.open('GET', url)
        xhr.onload = () => {
          return xhr.status === 200 
            ? resolve(q.strmem(xhr.responseText))
            : reject(xhr.status)
          
        }
        xhr.onerror = (e) => reject(e) 
        xhr.addEventListener('progress', e => {
          progress(e.loaded, total)
        });
        xhr.send()
      })
    })
}

const getFile = async function(file: string) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType('text\/plain; charset=x-user-defined');
    xhr.open('GET', file);
    xhr.onload = () => {
      resolve({
        status: xhr.status,
        responseText: xhr.responseText
      });
    }
    xhr.onerror = (e) => reject(e) 
    xhr.send();
  });
};

export const writeFile = (filename: string, data: Uint8Array, len: number) =>
{
  filename = filename.toLowerCase();
  var dest = [], i;
  for (i = 0; i < len; ++i)
    dest[i] = String.fromCharCode(data[i]);
  try
  {
    localStorage.setItem('Quake.' + com.state.searchpaths[com.state.searchpaths.length - 1].dir + '/' + filename, dest.join(''));
  }
  catch (e)
  {
    sys.print('COM.WriteFile: failed on ' + filename + '\n');
    Promise.resolve(false);
  }
  sys.print('COM.WriteFile: ' + filename + '\n');
  return Promise.resolve(true);
};

export const writeTextFile = (filename, data) =>
{
  filename = filename.toLowerCase();
  try
  {
    localStorage.setItem('Quake.' + com.state.searchpaths[com.state.searchpaths.length - 1].dir + '/' + filename, data);
  }
  catch (e)
  {
    sys.print('COM.WriteTextFile: failed on ' + filename + '\n');
    Promise.resolve(false);
  }
  sys.print('COM.WriteTextFile: ' + filename + '\n');
  return Promise.resolve(true);
};

const getLocalStorage = (game, filename) => {
  const path = game + '/' + filename;
  const data = localStorage.getItem('Quake.' + path);
  if (data != null)
  {
    sys.print('FindFile: ' + path + '\n');
    return q.strmem(data);
  }
  return null
}
const _loadFile = async (filename: string) : Promise<ArrayBuffer> => {
  filename = filename.toLowerCase();
  var i, j, search, netpath;
  
  for (i = com.state.searchpaths.length - 1; i >= 0; --i)
  {
    search = com.state.searchpaths[i];
    netpath = search.dir + '/' + filename;

    const data = getLocalStorage(search.dir, filename)
    if (data) {
      return data
    }

    for (j = 0; j < search.packs.length; j++) {
      const pack = search.packs[j]
      if (pack.type === 'indexeddb' && pack.data) {
        const file = pack.contents.find(p => p.name === filename)
        if (!file) {
          continue
        }
  
        return pack.data.slice(file.filepos, file.filepos + file.filelen);							
      }
    }

    // try indexedDb.
    const tryIndexedDb = await indexeddb.getAsset(search.dir, filename)
    if (tryIndexedDb) {
      return tryIndexedDb.data
    }

    // Meh. Problem is - if there's a  "game" search path, 
    // we end up searching the server
    // for ALL id1 assets. IS this necessary?
    // 
    // const gotFile = await getFile(netpath) as any;
    // if ((gotFile.status >= 200) && (gotFile.status <= 299))
    // {
    //   sys.print('FindFile: ' + netpath + '\n');
    //   return q.strmem(gotFile.responseText);
    // }
  }

  // As a workaround to the above, lets only search the server if we can't
  // find it in known packs
  for (i = com.state.searchpaths.length - 1; i >= 0; --i) {
    const gotFile = await getFile(netpath) as any;
    if ((gotFile.status >= 200) && (gotFile.status <= 299))
    {
      sys.print('FindFile: ' + netpath + '\n');
      return q.strmem(gotFile.responseText);
    }
  }

  sys.print('FindFile: can\'t find ' + filename + '\n');
};

export const loadFile = async (filename: string) : Promise<ArrayBuffer> => {
  draw.beginDisc(filename);

  const data = await _loadFile(filename)
  draw.endDisc();
  return data
}

// export const loadPackFile = async (dir: string, packName: string) : Promise<IPackedFile[]> => 
// {
//   const packfile = dir + '/' + packName
//   const gotHeader = await getFileRange(packfile, 0, 11) as any;
//   if ((gotHeader.status <= 199) || (gotHeader.status >= 300) || (gotHeader.responseText.length !== 12))
//     return;
//   var header = new DataView(q.strmem(gotHeader.responseText));
//   if (header.getUint32(0, true) !== 0x4b434150)
//     sys.error(packfile + ' is not a packfile');
//   var dirofs = header.getUint32(4, true);
//   var dirlen = header.getUint32(8, true);
//   var numpackfiles = dirlen >> 6;
//   if (numpackfiles !== 339)
//     com.state.modified = true;
//   var pack: IPackedFile[] = [];
//   if (numpackfiles !== 0)
//   {
//     const fileInfo = await getFileRange(packfile, dirofs, (dirofs + dirlen - 1)) as any
//     if ((fileInfo.status <= 199) || (fileInfo.status >= 300) || (fileInfo.responseText.length !== dirlen))
//       return;
//     var info = q.strmem(fileInfo.responseText);
//     if (crc.block(new Uint8Array(info)) !== 32981)
//       com.state.modified = true;
//     var i;
//     for (i = 0; i < numpackfiles; ++i)
//     {
//       pack[pack.length] = {
//         name: q.memstr(new Uint8Array(info, i << 6, 56)).toLowerCase(),
//         filepos: (new DataView(info)).getUint32((i << 6) + 56, true),
//         filelen: (new DataView(info)).getUint32((i << 6) + 60, true)
//       }
//     }
//   }
//   con.print('Added packfile ' + packfile + ' (' + numpackfiles + ' files)\n');
//   return pack;
// }

const getPackFileContents = (game, name, data) => {
  var header = new DataView(data);
  if (header.getUint32(0, true) !== 0x4b434150)
    sys.error(game + ':'+ name + ' from indexedDb is not a packfile');
  var dirofs = header.getUint32(4, true);
  var dirlen = header.getUint32(8, true);
  var numpackfiles = dirlen >> 6;
  if (numpackfiles !== 339)
    com.state.modified = true;
  var pack: IPackedFile[] = [];
  if (numpackfiles !== 0)
  {
    var info = new DataView(data, dirofs, dirlen);
    if (crc.block(new Uint8Array(data, dirofs, dirlen)) !== 32981)
      com.state.modified = true;
    var i;
    for (i = 0; i < numpackfiles; ++i)
    {
      pack.push({
        name: q.memstr(new Uint8Array(data, dirofs +  (i << 6), 56)).toLowerCase(),
        filepos: info.getUint32((i << 6) + 56, true),
        filelen: info.getUint32((i << 6) + 60, true)
      });
    }

    con.print('Added packfile ' + name + ' (' + numpackfiles + ' files)\n');
    
    return pack;
  }
}

// export const loadStorePackFiles = async (game: string): Promise<Array<{name: string, data: ArrayBuffer, contents: IPackedFile[]}>> => {
//   let entries = null
//   try {
//     entries = (await indexeddb.getAllAssetsPerGame(game) as any)
//       .filter(g => g.fileName.toLowerCase().indexOf('.pak') > -1)

//     if (!entries || entries.length === 0) {
//       return null
//     }
//   } catch{
//     return null
//   }

//   return entries.map(entry => ({
//     name: entry.fileName,
//     data: entry.data,
//     contents: getPackFileContents(game, entry.fileName, entry.data)
//   }))
// }

const loadStorePackFile = async (game: string, packName: string): Promise<{name: string, data: ArrayBuffer, type: string, contents: IPackedFile[]}> => {
  let entry = null
  try {
    entry = await indexeddb.getAsset(game, packName)

    if (!entry) {
      return null
    }
  } catch{
    return null
  }

  return {
    name: entry.fileName,
    data: entry.data,
    type: 'indexeddb',
    contents: getPackFileContents(game, entry.fileName, entry.data)
  }
}

const loadServerPackFile = async (game: string, packName: string) : Promise<{name: string, data: ArrayBuffer, type: string, contents: IPackedFile[]}> => {
  const packfile = game + '/' + packName

  try {
    const data = await getFileWithProgress(packfile, (current, total) => {
      // TODO UI Progress
    })
    if (!data) {
      return null
    }
    var dataDv = new DataView(data);
    if (dataDv.getUint32(0, true) !== 0x4b434150){
      con.print(packfile + ' is not a packfile');
      return null
    }
    var dirlen = dataDv.getUint32(8, true);
    var numpackfiles = dirlen >> 6;
    if (numpackfiles !== 339)
      com.state.modified = true;

    await indexeddb.saveAsset(game, packName, numpackfiles, data)

    return {
      name: packName,
      data,
      type: 'indexeddb',
      contents: getPackFileContents(game, packName, data)
    }
  } catch{
    return null
  }
}

export const loadPackFile = async (dir: string, packName: string) : Promise<{name: string, data: ArrayBuffer, type: string, contents: IPackedFile[]}> => {
  let entry = await loadStorePackFile(dir, packName)
  if (!entry) {
    entry = await loadServerPackFile(dir, packName)
  }

  return entry
}