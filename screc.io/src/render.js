const { webFrame, dialog } = require("electron");
webFrame.setZoomFactor(1);

// js document object model rules

const start = document.getElementById("start");
const stop = document.getElementById("stop");
const selectVideo = document.getElementById("selectVideo");

const vid = document.querySelector("video")
const { desktopCapturer, remote } = require('electron');
const { Menu } = remote;
const { writeFile } = require('fs');

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

let mediaRecorder;
const recordedBits = []; // ability to record video in segments

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

	const options = {mimeType: 'video/webm; codecs=vp9'};
	recorder = new MediaRecorder(stream, options);

	mediaRecorder.ondataavailable = handleDataAvailable;
	mediaRecorder.onstop = handleStop;
}

function handleDataStart(e){
	console.log("recording video!");
	recordedBits.push(e.data);
}

async function handleDataStop(e) {
	const recordedBlob = new Blob(recordedBits, {
		type: 'video/webm; codecs=vp9'
	});
	const storeInBuffer = Buffer.from(await recordedBlob.arrayBuffer());

	const { saveFilePath } = await dialog.showSaveDialog({
		buttonLabel: 'Save Video?',
		defaultPath: `screc-${Date.now()}.webm`
	});

	console.log("Saving video to ", saveFilePath);

	writeFile(saveFilePath, storeInBuffer, () =>
		console.log("Video Saved Successfully!")
	);
}

selectVideo.onclick = getVideo;