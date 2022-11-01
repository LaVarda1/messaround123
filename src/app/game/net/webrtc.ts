import ISocket from '../../../engine/interfaces/net/ISocket'
import IDatagram from '../../../engine/interfaces/net/IDatagram'
import * as net from '../../../engine/net'
import * as def from '../../../engine/def'
import { QConnectStatus } from '../../../engine/interfaces/net/INetworkDriver'

export const name: string = "webrtc"
export var initialized: boolean = false;
export var available: boolean = false;

const TIME_TO_CONNECT = 6000

type Rtc = {
	init: () => void
	answer: (sdp: any) => void
	addCandidate: (candidate: any) => void
	sendBytes: (bytes: any) => void
	connectionState: () => RTCPeerConnectionState
	close: () => void
}

type WebRtcDriver = {
  rtc: Rtc,
  signaling: WebSocket,
  sock: ISocket
}

const tryJson = (str, def) => {
  try { 
    return JSON.parse(str) 
  }
  catch (err) {
    return def
  }
}

export const init = () => { 
	if(typeof window === "undefined")
		return
	if (window['WebSocket'] == null)
		return;
	available = true;
	return true;
};
export const listen = () => {}
export const  connect = async (host: string): Promise<QConnectStatus> =>
{
	if (host.length <= 5)
		return 'failed'
	if (host.charCodeAt(6) === 47)
		return 'failed'
	if (host.substring(0, 6) !== 'wss://' && host.substring(0, 5) !== 'ws://')
		return 'failed'

	var sock = net.newQSocket();
	sock.disconnected = true;
	sock.receiveMessage = []
	sock.address = host;

	try
	{
		sock.driverdata = await createDriver(sock, new WebSocket(host, 'webrtc'))
	}
	catch (e)
	{
		return 'failed'
	}
	net.state.newsocket = sock;
	return 'connected';
};

const createDriver = async (socket: ISocket, signaling: WebSocket) => {
  const driver = {
		rtc: createRtc(signaling, socket),
    signaling,
    sock: socket
  }
  signaling.addEventListener('message', onSignalingReceive(driver))
	// TODO: FIgure out this hack - what can we wait on to get the ball rolling on rtc?
	await new Promise((resolve) => {
		signaling.addEventListener('open', () => setTimeout(resolve, 100))
	})
	await driver.rtc.init()

  return driver
}
const onSignalingReceive = (driver: WebRtcDriver) => (message) => {
  const msg = tryJson(message.data, {type: 'none'})
  if (msg.type === 'answer') {
    console.log("Received answer...")
    driver.rtc.answer(msg.data);
  } else if (msg.type === 'candidate') {
    console.log("Received ICE candidate...")
    driver.rtc.addCandidate(msg.data)
  } else {
    console.log('Unrecognized Signaling message type.');
  }
}

export const checkNewConnections = (): ISocket => {
	return null
}

export const getMessage = function(sock: ISocket)
{
	if (sock.driverdata == null)
		return -1;
	if (sock.driverdata.rtc.connectionState() !== 'connected')
		return -1;
	if (sock.receiveMessage.length === 0)
		return 0;
	var buffer = sock.receiveMessage.shift()
	var message = new Uint8Array(buffer, 1, buffer.byteLength - 1)
	net.state.message.cursize = message.length;
	(new Uint8Array(net.state.message.data)).set(message);
	return message[0];
};

export const sendMessage = function(sock: ISocket, data: IDatagram)
{
	if (sock.driverdata == null)
		return -1;
	if (sock.driverdata.rtc.connectionState() !== 'connected')
		return -1;
	var buf = new ArrayBuffer(data.cursize + 1), dest = new Uint8Array(buf);
	dest[0] = 1;
	dest.set(new Uint8Array(data.data, 0, data.cursize), 1);
	sock.driverdata.rtc.sendBytes(buf);
	return 1;
};

export const sendUnreliableMessage = function(sock: ISocket, data: IDatagram)
{
	if (sock.driverdata == null)
		return -1;
	if (sock.driverdata.rtc.connectionState() !== 'connected')
		return -1;
	var buf = new ArrayBuffer(data.cursize + 1), dest = new Uint8Array(buf);
	dest[0] = 2;
	dest.set(new Uint8Array(data.data, 0, data.cursize), 1);
	sock.driverdata.rtc.sendBytes(buf);
	return 1;
};

export const canSendMessage = function(sock: ISocket): boolean| undefined
{
	if (sock.driverdata == null)
		return;
	if (sock.driverdata.rtc.connectionState() === 'connected')
		return true
};

export const close = function(sock: ISocket)
{
	if (sock.driverdata != null)
		sock.driverdata.rtc.close();
};

export const checkForResend = function()
{
	const state = net.state.newsocket.driverdata.rtc.connectionState()
	if (state === 'connected')
		return 1;
	if (state !== 'connecting' && state !== 'new')
		return -1;
};

export const registerWithMaster = () => {
	// Cannot connect to browser server, no peer to peer.
}

const createRtc = (signaling: WebSocket, sock: ISocket) => {
	const sendSignal = (obj: any) => {
		if (signaling.readyState !== 1) debugger
		console.log ('signal: sending ' + obj.type)
		signaling.send(JSON.stringify(obj))
	}
	let rtcPeer: null | RTCPeerConnection = null
	let rtcDataChannel: null | RTCDataChannel = null
	
	const init = async () => {
		return new Promise<void>((resolve, reject) => {
			rtcPeer = new RTCPeerConnection({
				iceServers: [
					{
						urls: [
							"stun:stun4.l.google.com:19302",
							"stun:stun.nextcloud.com:443",
							"stun:stun.intervoip.com:3478"
						]
					}
				]
			})
		
			rtcPeer.addEventListener('connectionstatechange', () => {
				console.log('changeed to  ' + rtcPeer!.connectionState)
				if (rtcPeer!.connectionState === 'closed') {
					reject()
					net.close(sock)
					rtcPeer!.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange);
				} else if(rtcPeer!.connectionState === 'connected') {
					resolve()
				}
			})
		
			rtcDataChannel = rtcPeer.createDataChannel('quake', {
				ordered: false,
				maxRetransmits: 0
			})
			rtcDataChannel.addEventListener('message', (event => {
				sock.receiveMessage.push(event.data)
			}));
		
			let connectionTimer: number | null = null
			connectionTimer = setTimeout(() => {
				if (!rtcPeer || rtcPeer.iceConnectionState !== 'connected'
					&& rtcPeer.iceConnectionState !== 'completed') {
					reject()
					net.close(sock)
					console.log("Could not connect")
				}
			}, TIME_TO_CONNECT);
			let reconnectionTimer: number | null = null
			const onIceConnectionStateChange = () => {
				if (!rtcPeer ||rtcPeer.iceConnectionState === 'connected'
					|| rtcPeer.iceConnectionState === 'completed') {
					if (connectionTimer) {
						clearTimeout(connectionTimer);
						connectionTimer = null;
					}
					if (reconnectionTimer)
						clearTimeout(reconnectionTimer);
					reconnectionTimer = null;
				} else if (rtcPeer.iceConnectionState === 'disconnected'
					|| rtcPeer.iceConnectionState === 'failed') {
					reject()
					net.close(sock)
					console.log("Closing connection due to disconnection")
				}
			};
		
		
			rtcPeer.addEventListener('icecandidate', (event) => {
				if (event.candidate) {
					sendSignal({
						type: "candidate",
						data: event.candidate
					});
				}
			})
		
			rtcPeer.addEventListener('negotiationneeded', (event) => {
				return rtcPeer!.createOffer({
					offerToReceiveAudio: false,
					offerToReceiveVideo: false
				})
					.then((offer) => {
						rtcPeer!.setLocalDescription(offer)
						sendSignal({
							type: "offer",
							data: offer
						});
					})
			})
			
			rtcPeer.addEventListener('iceconnectionstatechange', onIceConnectionStateChange);
		})
	}

  return {
		init,
    answer: (sdp) => {
			if (!rtcPeer) return Promise.reject('Connection hasn\'t started')
      rtcPeer.setRemoteDescription(new RTCSessionDescription(sdp))
      return rtcPeer.createAnswer(sdp)
        .then((answerSdp) => {
          rtcPeer!.setLocalDescription(answerSdp)
          return answerSdp
        })
    },
    addCandidate: (candidate) => {
			if (!rtcPeer) return Promise.reject('Connection hasn\'t started')
      return rtcPeer.addIceCandidate(new RTCIceCandidate(candidate))
    },
    sendBytes: (bytes) => {
			if (!rtcDataChannel) {
				return Promise.reject('Connection isn\'t ready for transfer')
			}
      return rtcDataChannel.send(bytes)
    },
		//"closed" | "connected" | "connecting" | "disconnected" | "failed" | "new";
    connectionState: () => {
			if (!rtcPeer) return 'new'
			return rtcPeer.connectionState !== 'connected'
			 ? rtcPeer.connectionState
			 : rtcDataChannel?.readyState !== 'open' ? 'connecting' : 'connected'
    },
    close: () => {
			if (rtcPeer) {
				rtcPeer.close();
			}
		}
  }
}