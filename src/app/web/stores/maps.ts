import axios from 'axios'
import {AxiosResponse}  from 'axios'
import * as JSZip from 'jszip'
import * as indexedDb from '../../../shared/indexeddb'
import {any, tail, find, prop} from 'ramda'
import {QuaddictedMap} from '../types/QuaddictedMap'
import { defineStore } from 'pinia'
import { useGameStore } from './game'

var mapListingPromise = null

const quaddictedMapsUrl = '/api/maps'
// const quaddictedMapsUrl = 'http://localhost:3000/api/maps'

type MapLoadState = 'loading' | 'idle' | 'error'
type LoadProgress = {
  loaded: number
  total: number
  message: string
}
interface State {
  mapListing: QuaddictedMap[]
  mapLoadState: MapLoadState
  mapLoadProgress: LoadProgress
}

export const useMapsStore = defineStore('maps', {
  state: (): State => ({
    mapListing: [],
    mapLoadState: 'idle',
    mapLoadProgress: {
      loaded: 0,
      total: 0,
      message: ''
    }
  }),
  getters: {
    getMapListing: (state: State) => state.mapListing,
    getMapLoadProgress: (state: State) => state.mapLoadProgress,
    getMapLoadState: (state: State) => state.mapLoadState,
    getMapFromId: (state: State) => (id: string): QuaddictedMap => find<QuaddictedMap>(map => map.id === id, state.mapListing)
  },
  actions: {
    setMapLoadState (mapLoadState: MapLoadState) {
      this.mapLoadState = mapLoadState
    },
    setMapListing (mapListing: QuaddictedMap[])  {
      this.mapListing = mapListing
    },
    setMapLoadProgress ({loaded, total, message})  {
      this.mapLoadProgress.loaded = loaded || loaded === 0 ? loaded : this.mapLoadProgress.loaded
      this.mapLoadProgress.total = total || total === 0 ? total : this.mapLoadProgress.total
      this.mapLoadProgress.message = message || loaded === '' ? message : this.mapLoadProgress.message
    },
    async loadMapListing () { 
      if (!mapListingPromise) {
        mapListingPromise = await axios.get<AxiosResponse<QuaddictedMap>>(quaddictedMapsUrl)
          .then(response => this.setMapListing(response.data))
      }
      return mapListingPromise
    },
    async loadMap (mapId) {
      const gameStore = useGameStore()
      const hasGame = await indexedDb.hasGame(mapId)
      return hasGame
        ? Promise.resolve() 
        : this.loadMapZip(saveToIndexedDb, mapId)
            .then(() => gameStore.loadAssets())
  
    },
    async loadDownloaded () {
      // const indexedDb.saveAsset(mapId, fileName, 0, data)
    },
    async loadMapZip (fileHandler, mapId) {
      this.setMapLoadState('loading')
      this.setMapLoadProgress({loaded: 0, total: 0, message: 'Downloading...'})
    
      try {
        const url = quaddictedMapsUrl + '/' + mapId
        const mapsMeta = prop('data', await axios.get(url))
        const arrayBuf = await getBinaryData(mapsMeta.downloadLink, mapsMeta.byteLength, (loaded, total) => {
          this.setMapLoadProgress({loaded, total, message: 'Downloading...'})
        })
    
        this.setMapLoadProgress({ message: 'Unzipping...'})
      
        const zip = new JSZip()
        await zip.loadAsync(arrayBuf)
    
        // Ignore entries marked as directories
        const files = Object.keys(zip.files).filter(f => !zip.files[f].dir)
      
        const fixedFilePaths = fixBaseDir(files)
      
        // Unzip all files, and send them to the file handler
        await Promise.all(files.map((fileName, idx) => {
          return zip.file(fileName)
            .async("arraybuffer")
            .then(buffer => fileHandler(mapId, fixedFilePaths[idx], buffer))
        }))
    
        this.setMapLoadProgress({loaded: 0, total: 0, message: ''})
        this.setMapLoadState('idle')
      }
      catch (err) {
        // make sure this is cleaned up.
        this.setMapLoadProgress({loaded: 0, total: 0, message: ''})
        this.setMapLoadState('idle')
    
        throw err
      }
    }
  }
})

const strmem = function(src)
{
	var buf = new ArrayBuffer(src.length)
	var dest = new Uint8Array(buf)
	var i
	for (i = 0; i < src.length; ++i)
		dest[i] = src.charCodeAt(i) & 255
	return buf
}
// function getBinarySize (url) {
//   return new Promise((resolve, reject) => {
//     var xhr = new XMLHttpRequest();
//     xhr.open("HEAD", url, true); // Notice "HEAD" instead of "GET",
//                                  //  to get only the header
//     xhr.onreadystatechange = function() {
//       if (this.readyState == this.DONE) {
//         resolve(parseInt(xhr.getResponseHeader("Content-Length")));
//       }
//     };
//     xhr.onerror = reject
//     xhr.send();
//   })
// }

const getBinaryData = (url, total, progress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.overrideMimeType('text\/plain; charset=x-user-defined')
    xhr.open('GET', url)
    xhr.onload = () => {
      resolve(strmem(xhr.responseText));    
    }
    xhr.onerror = (e) => reject(e) 
    xhr.addEventListener('progress', e => {
      progress(e.loaded, total)
    });
    xhr.send()
  })
}

const anyFirstElementContains = searchTerm =>
  any(fa => fa.length && fa[0].toLowerCase().indexOf(searchTerm) > -1)

const anyFirstElementIs = searchTerm =>
  any(fa => fa.length && fa[0].toLowerCase() === searchTerm)

const fixBaseDir = (fileList) => {
  const hasAMapAtRoot = anyFirstElementContains('.bsp')
  const hasMapDirAtRoot = anyFirstElementIs('maps')
  const hasPakFileAtRoot = anyFirstElementContains('.pak')

  const fileArrays = fileList.map(file => file.split('/'))
  if (hasAMapAtRoot(fileArrays)) {
    return fileArrays.map(fa => ['maps'].concat(fa).join('/'))
  } else if (hasMapDirAtRoot(fileArrays) || hasPakFileAtRoot(fileArrays)) {
    return fileArrays.map(fa => fa.join('/'))
  } else {
    let removedSubDir = fileArrays.map(fa => fa.length > 1 ? tail(fa) : fa)
    if (hasAMapAtRoot(removedSubDir)) {
      removedSubDir = removedSubDir.map(fa => ['maps'].concat(fa))
    }
    return removedSubDir.map(fa => fa.join('/'))
  }
}

const saveToIndexedDb = (mapId, fileName, data) => {
  return indexedDb.saveAsset(mapId, fileName, 0, data)
}