import axios from 'axios'
import * as JSZip from 'jszip'
import * as indexedDb from '../helpers/indexeddb'
import {any, tail} from 'ramda'

const quaddictedMapsUrl = 'http://maps.netquake.io/api/maps'
//const quaddictedMapsUrl = 'http://localhost:3000/api/maps'

const state = {
  mapListing: [],
  mapIsLoading: false,
  mapLoadProgress: {
    loaded: 0,
    total: 0,
    message: ''
  }
}

const mutationTypes = {
  setMapListing: 'setMapListing',
  setMapLoadProgress: 'setMapLoadProgress',
  setMapIsLoading: 'setMapIsLoading'
}

const getters = {
  getMapListing: state => state.mapListing,
  getMapLoadProgress: state => state.mapLoadProgress,
  getMapIsLoading: state => state.mapIsLoading,
}

const mutations = {
  [mutationTypes.setMapIsLoading] (state, mapIsLoading) {
    state.mapIsLoading = mapIsLoading
  },
  [mutationTypes.setMapListing] (state, mapListing) {
    state.mapListing = mapListing
  },
  [mutationTypes.setMapLoadProgress] (state, {loaded, total, message}) {
    state.mapLoadProgress.loaded = loaded || loaded === 0 ? loaded : state.mapLoadProgress.loaded
    state.mapLoadProgress.total = total || total === 0 ? total : state.mapLoadProgress.total
    state.mapLoadProgress.message = message || loaded === '' ? message : state.mapLoadProgress.message
  }
}

const strmem = function(src)
{
	var buf = new ArrayBuffer(src.length)
	var dest = new Uint8Array(buf)
	var i
	for (i = 0; i < src.length; ++i)
		dest[i] = src.charCodeAt(i) & 255
	return buf
}
function getBinarySize (url) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, true); // Notice "HEAD" instead of "GET",
                                 //  to get only the header
    xhr.onreadystatechange = function() {
      if (this.readyState == this.DONE) {
        resolve(parseInt(xhr.getResponseHeader("Content-Length")));
      }
    };
    xhr.onerror = reject
    xhr.send();
  })
}

const getBinaryData = (url, progress) => {
  return getBinarySize(url)
    .then(total => {
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
    })
}

const anyFirstElementContains = searchTerm =>
  any(fa => fa[0].toLowerCase().indexOf(searchTerm) > -1)

const anyFirstElementIs = searchTerm =>
  any(fa => fa[0].toLowerCase() === searchTerm)

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
    return fileArrays.map(fa => tail(fa).join('/'))
  }
}

const getMapZip = async (fileHandler, mapId, commit) => {
  commit(mutationTypes.setMapIsLoading, true)
  commit(mutationTypes.setMapLoadProgress, {loaded: 0, total: 0, message: 'Downloading...'})

  try {
    const url = quaddictedMapsUrl + '/' + mapId
    const arrayBuf = await getBinaryData(url, (loaded, total) => {
      commit(mutationTypes.setMapLoadProgress, {loaded, total, message: 'Downloading...'})
    })

    commit(mutationTypes.setMapLoadProgress, { message: 'Unzipping...'})
  
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

    commit(mutationTypes.setMapLoadProgress, {loaded: 0, total: 0, message: ''})
    commit(mutationTypes.setMapIsLoading, false)
  }
  catch (err) {
    // make sure this is cleaned up.
    commit(mutationTypes.setMapLoadProgress, {loaded: 0, total: 0, message: ''})
    commit(mutationTypes.setMapIsLoading, false)

    throw err
  }
}

const saveToIndexedDb = (mapId, fileName, data) => {
  return indexedDb.saveAsset(mapId, fileName, 0, data)
}

const actions = {
  loadMapListing ({commit}) { 
    return axios.get(quaddictedMapsUrl)
      .then(response => commit(mutationTypes.setMapListing, response.data))
  },
  async loadMap ({commit, dispatch}, mapId) {
    const hasGame = await indexedDb.hasGame(mapId)
    return hasGame
      ? Promise.resolve() 
      : getMapZip(saveToIndexedDb, mapId, commit)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

