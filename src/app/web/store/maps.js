import axios from 'axios'
import * as JSZip from 'jszip'
import * as indexedDb from '../helpers/indexeddb'
import {any, tail} from 'ramda'

//const quaddictedMapsUrl = 'http://maps.netquake.io/api/maps'
const quaddictedMapsUrl = 'http://localhost:3000/api/maps'

const state = {
  mapListing: []
}

const mutationTypes = {
  setMapListing: 'setMapListing'
}

const getters = {
  getMapListing: state => state.mapListing
}

const mutations = {
  [mutationTypes.setMapListing] (state, mapListing) {
    state.mapListing = mapListing
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

const getBinaryData = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.overrideMimeType('text\/plain; charset=x-user-defined')
    xhr.open('GET', url)
    xhr.onload = () => {
      resolve(strmem(xhr.responseText));    
    }
    xhr.onerror = (e) => reject(e) 
    xhr.send()
  })
}

const fixBaseDir = (fileList) => {
  const fileArrays = fileList.map(file => file.split('/'))
  if (any(fa => fa[0].toLowerCase().indexOf('.bsp') > -1, fileArrays)) {
    return fileArrays.map(fa => ['maps'].concat(fa).join('/'))
  } else if (any(fa => fa[0].toLowerCase().indexOf('maps') > -1, fileArrays)
      || any(fa => fa[0].toLowerCase().indexOf('.pak') > -1, fileArrays)) {
    return fileArrays.map(fa => fa.join('/'))
  } else {
    return fileArrays.map(fa => tail(fa).join('/'))
  }
}

const getMapZip = async (fileHandler, mapId) => {
  const url = quaddictedMapsUrl + '/' + mapId
  const arrayBuf = await getBinaryData(url)
  const zip = new JSZip()
  
  await zip.loadAsync(arrayBuf)

  const files = Object.keys(zip.files).filter(f => !zip.files[f].dir)

  const fixedFilePaths = fixBaseDir(files)

  return await Promise.all(files.map((fileName, idx) => {
    return zip.file(fileName).async("arraybuffer").then(buffer => fileHandler(mapId, fixedFilePaths[idx], buffer))
  }))
}

const saveToIndexedDb = (mapId, fileName, data) => {
  return indexedDb.saveAsset(mapId, fileName, 0, data)
}

const actions = {
  loadMapListing ({commit}) { 
    return axios.get(quaddictedMapsUrl)
      .then(response => commit(mutationTypes.setMapListing, response.data))
  },
  loadMap ({commit, dispatch}, mapId) { 
    return getMapZip(saveToIndexedDb, mapId)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

