const { webFrame, desktopCapturer, remote } = require("electron");
webFrame.setZoomFactor(1);

const { dialog, Menu } = remote;
const { writeFile } = require('fs');
// js document object model rules

let mediaRecorder;
const recordedBits = []; // ability to record video in segments
const vid = document.querySelector('video');

const start = document.getElementById('start');
start.onclick = x => {
	mediaRecorder.start();
	start.classList.add('btn-danger');
	start.innerText = "Recording";
};

const stop = document.getElementById("stop");
stop.onclick = x => {
	mediaRecorder.stop();
	start.classList.remove('btn-danger');
	start.innerText = "Start";
};

const selectVideo = document.getElementById("selectVideo");
selectVideo.onclick = getVideo;

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

	const options = {mimeType: 'video/webm; codecs=vp9'};
	mediaRecorder = new MediaRecorder(stream, options);

	mediaRecorder.ondataavailable = handleDataStart;
	mediaRecorder.onstop = handleDataStop;
}

function handleDataStart(e){
	console.log("Saving video...");
	recordedBits.push(e.data);
}

async function handleDataStop(e) {
	const recordedBlob = new Blob(recordedBits, {
		type: 'video/webm; codecs=vp9'
	});

	const storeInBuffer = Buffer.from(await recordedBlob.arrayBuffer());

	const { filePath } = await dialog.showSaveDialog({
		buttonLabel: 'Save Video',
		defaultPath: `screc-${Date.now()}.webm`
	});

	console.log("Saving video to ", filePath);

	if (filePath){
		writeFile(filePath, storeInBuffer, () =>	
			console.log("Video Saved Successfully!"));
	}
}