const { webFrame } = require("electron");
webFrame.setZoomFactor(1);

// js document object model rules

const start = document.getElementById("start");
const stop = document.getElementById("stop");
const selectVideo = document.getElementById("selectVideo");

const vid = document.querySelector("video")
const { desktopCapturer, remote } = require('electron');
const { Menu } = remote;

async function getVideo(){
	const input = await desktopCapturer.getSources({
		types:[
			'window',
			'screen'
		]
	});

	const optionMenu = Menu.buildFromTemplate(
		input.map(source => {
			return {
				label: source.name,
				click: () => selectSource(source)
			};
		})
	);

	optionMenu.popup();
}

async function selectSource(source){
	selectVideo.innerText = "Displaying: " + source.name;
	const constraints = {
		audio: false,
		video: {
			mandatory: {
				chromeMediaSource: 'desktop',
				chromeMediaSourceId: source.id
			}
		}
	};
	const stream = await navigator.mediaDevices.getUserMedia(constraints);

	// add preview in app
	vid.srcObject = stream;
	vid.play();
}

selectVideo.onclick = getVideo;