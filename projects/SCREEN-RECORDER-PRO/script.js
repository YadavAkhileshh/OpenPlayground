// Three.js (This is the Background Animation)
// HAPPY CODING
// Created by: Justin Linwood Ross 
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('three-container').appendChild(renderer.domElement);

const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
const material = new THREE.MeshPhongMaterial({
    color: 0x667eea,
    transparent: true,
    opacity: 0.6,
    wireframe: true
});
const torusKnot = new THREE.Mesh(geometry, material);
scene.add(torusKnot);

const light = new THREE.PointLight(0x764ba2, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

camera.position.z = 30;

function animate() {
    requestAnimationFrame(animate);
    torusKnot.rotation.x += 0.005;
    torusKnot.rotation.y += 0.005;
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Screen Recorder Logic
let mediaRecorder;
let recordedChunks = [];
let videoLibrary = [];
let currentEditingVideo = null;
let recordingStartTime;
let recordingInterval;
let timelineClips = [];

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const previewVideo = document.getElementById('previewVideo');
const statusBar = document.getElementById('statusBar');
const recordingIndicator = document.getElementById('recordingIndicator');
const recordingTime = document.getElementById('recordingTime');
const videoLibraryEl = document.getElementById('videoLibrary');
const timeline = document.getElementById('timelineTrack');
const trimBtn = document.getElementById('trimBtn');
const cropBtn = document.getElementById('cropBtn');
const insertBtn = document.getElementById('insertBtn');
const exportBtn = document.getElementById('exportBtn');

startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
trimBtn.addEventListener('click', openTrimEditor);
cropBtn.addEventListener('click', openCropEditor);
insertBtn.addEventListener('click', insertVideo);
exportBtn.addEventListener('click', exportVideo);

async function startRecording() {
    try {
        const audioEnabled = document.getElementById('audioToggle').checked;

        let stream;
        const displayMediaOptions = {
            video: {
                cursor: "always"
            },
            audio: false
        };

        stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

        if (audioEnabled) {
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const audioTrack = audioStream.getAudioTracks()[0];
                stream.addTrack(audioTrack);
            } catch (e) {
                console.warn('Audio not available:', e);
            }
        }

        recordedChunks = [];
        const options = { mimeType: 'video/webm;codecs=vp9' };
        
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm;codecs=vp8';
        }

        mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = handleRecordingStop;

        mediaRecorder.start(100);
        recordingStartTime = Date.now();
        startRecordingTimer();

        startBtn.disabled = true;
        stopBtn.disabled = false;
        startBtn.classList.add('recording');
        recordingIndicator.classList.add('active');
        statusBar.textContent = 'Recording in progress...';
        statusBar.classList.add('recording');

        stream.getVideoTracks()[0].addEventListener('ended', () => {
            stopRecording();
        });

    } catch (err) {
        console.error('Error starting recording:', err);
        statusBar.textContent = 'Error: ' + err.message;
    }
}

function startRecordingTimer() {
    recordingInterval = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        recordingTime.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        clearInterval(recordingInterval);
    }

    startBtn.disabled = false;
    stopBtn.disabled = true;
    startBtn.classList.remove('recording');
    recordingIndicator.classList.remove('active');
    statusBar.classList.remove('recording');
}

function handleRecordingStop() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const duration = (Date.now() - recordingStartTime) / 1000;

    const video = {
        id: Date.now(),
        url: url,
        blob: blob,
        duration: duration,
        name: `Recording ${new Date().toLocaleString()}`,
        trimStart: 0,
        trimEnd: duration,
        crop: null
    };

    videoLibrary.push(video);
    addVideoToLibrary(video);
    addVideoToTimeline(video);

    previewVideo.src = url;
    currentEditingVideo = video;
    statusBar.textContent = 'Recording saved! Duration: ' + duration.toFixed(1) + 's';
    
    enableEditorButtons();
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `screen-recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function addVideoToLibrary(video) {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'video-thumbnail';
    thumbnail.dataset.videoId = video.id;

    const videoEl = document.createElement('video');
    videoEl.src = video.url;
    videoEl.muted = true;

    const overlay = document.createElement('div');
    overlay.className = 'thumbnail-overlay';
    overlay.textContent = video.duration.toFixed(1) + 's';

    thumbnail.appendChild(videoEl);
    thumbnail.appendChild(overlay);

    thumbnail.addEventListener('click', () => {
        document.querySelectorAll('.video-thumbnail').forEach(t => 
            t.classList.remove('selected'));
        thumbnail.classList.add('selected');
        currentEditingVideo = video;
        previewVideo.src = video.url;
        enableEditorButtons();
    });

    videoLibraryEl.appendChild(thumbnail);
}

function addVideoToTimeline(video, position = null) {
    const clip = document.createElement('div');
    clip.className = 'video-clip';
    clip.dataset.videoId = video.id;
    clip.textContent = video.name;
    
    const width = (video.trimEnd - video.trimStart) * 50;
    clip.style.width = width + 'px';
    clip.style.left = (position !== null ? position : timelineClips.length * 10) + 'px';

    const leftHandle = document.createElement('div');
    leftHandle.className = 'trim-handle left';
    const rightHandle = document.createElement('div');
    rightHandle.className = 'trim-handle right';

    clip.appendChild(leftHandle);
    clip.appendChild(rightHandle);

    makeDraggable(clip);
    makeTrimmable(clip, leftHandle, rightHandle, video);

    timeline.appendChild(clip);
    timelineClips.push({ clip, video });
}

function makeDraggable(element) {
    let pos1 = 0, pos3 = 0;
    
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        if (e.target.classList.contains('trim-handle')) return;
        e.preventDefault();
        pos3 = e.clientX;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos3 = e.clientX;
        const newLeft = Math.max(0, element.offsetLeft - pos1);
        element.style.left = newLeft + 'px';
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function makeTrimmable(clip, leftHandle, rightHandle, video) {
    leftHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        handleTrim(e, clip, video, 'left');
    });

    rightHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        handleTrim(e, clip, video, 'right');
    });
}

function handleTrim(e, clip, video, side) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = clip.offsetWidth;
    const startLeft = clip.offsetLeft;

    function onMouseMove(e) {
        const delta = e.clientX - startX;
        
        if (side === 'left') {
            const newLeft = Math.max(0, startLeft + delta);
            const newWidth = Math.max(50, startWidth - delta);
            clip.style.left = newLeft + 'px';
            clip.style.width = newWidth + 'px';
            video.trimStart = Math.max(0, video.trimStart + (delta / 50));
        } else {
            const newWidth = Math.max(50, startWidth + delta);
            clip.style.width = newWidth + 'px';
            video.trimEnd = Math.min(video.duration, video.trimStart + (newWidth / 50));
        }
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function openTrimEditor() {
    if (!currentEditingVideo) return;
    
    const start = prompt('Enter start time (seconds):', currentEditingVideo.trimStart.toFixed(1));
    const end = prompt('Enter end time (seconds):', currentEditingVideo.trimEnd.toFixed(1));
    
    if (start !== null && end !== null) {
        currentEditingVideo.trimStart = Math.max(0, parseFloat(start));
        currentEditingVideo.trimEnd = Math.min(currentEditingVideo.duration, parseFloat(end));
        
        const clipData = timelineClips.find(c => c.video.id === currentEditingVideo.id);
        if (clipData) {
            const width = (currentEditingVideo.trimEnd - currentEditingVideo.trimStart) * 50;
            clipData.clip.style.width = width + 'px';
        }
        
        statusBar.textContent = 'Trim applied: ' + 
            currentEditingVideo.trimStart.toFixed(1) + 's to ' + 
            currentEditingVideo.trimEnd.toFixed(1) + 's';
    }
}

function openCropEditor() {
    if (!currentEditingVideo) return;
    
    const modal = document.getElementById('cropModal');
    const cropPreview = document.getElementById('cropPreview');
    const cropArea = document.getElementById('cropArea');
    
    cropPreview.src = currentEditingVideo.url;
    modal.classList.add('active');
    
    cropArea.style.width = '80%';
    cropArea.style.height = '80%';
    cropArea.style.left = '10%';
    cropArea.style.top = '10%';
    
    const cropContainer = document.getElementById('cropContainer');
    makeCropAreaDraggable(cropArea, cropContainer);
    
    document.getElementById('applyCropBtn').onclick = () => {
        const container = document.getElementById('cropContainer');
        const rect = cropArea.getBoundingClientRect();
        const videoRect = cropPreview.getBoundingClientRect();
        
        currentEditingVideo.crop = {
            x: (rect.left - videoRect.left) / videoRect.width,
            y: (rect.top - videoRect.top) / videoRect.height,
            width: rect.width / videoRect.width,
            height: rect.height / videoRect.height
        };
        
        modal.classList.remove('active');
        statusBar.textContent = 'Crop settings saved';
    };
    
    document.getElementById('cancelCropBtn').onclick = () => {
        modal.classList.remove('active');
    };

    // Add event listeners for crop handles (vitally important for resizing the crop area)
    document.querySelectorAll('.crop-handle').forEach(handle => {
        handle.onmousedown = (e) => resizeCropArea(e, handle);
    });
}

function makeCropAreaDraggable(element, container) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        if (e.target.classList.contains('crop-handle')) return;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

  
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        const containerRect = container.getBoundingClientRect();
        const newTop = Math.max(0, Math.min(container.clientHeight - element.offsetHeight, element.offsetTop - pos2));
        const newLeft = Math.max(0, Math.min(container.clientWidth - element.offsetWidth, element.offsetLeft - pos1));
        
        element.style.top = newTop + 'px';
        element.style.left = newLeft + 'px';
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function resizeCropArea(e, handle) {
    e.preventDefault();
    const cropArea = document.getElementById('cropArea');
    const container = document.getElementById('cropContainer');
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = cropArea.offsetWidth;
    const startHeight = cropArea.offsetHeight;
    const startLeft = cropArea.offsetLeft;
    const startTop = cropArea.offsetTop;

    function onMouseMove(e) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const containerRect = container.getBoundingClientRect();

        if (handle.classList.contains('tl')) {
            const newLeft = Math.max(0, Math.min(startLeft + startWidth - 50, startLeft + deltaX));
            const newTop = Math.max(0, Math.min(startTop + startHeight - 50, startTop + deltaY));
            cropArea.style.left = newLeft + 'px';
            cropArea.style.top = newTop + 'px';
            cropArea.style.width = (startWidth - (newLeft - startLeft)) + 'px';
            cropArea.style.height = (startHeight - (newTop - startTop)) + 'px';
        } else if (handle.classList.contains('tr')) {
            const newTop = Math.max(0, Math.min(startTop + startHeight - 50, startTop + deltaY));
            const newWidth = Math.max(50, Math.min(container.clientWidth - startLeft, startWidth + deltaX));
            cropArea.style.top = newTop + 'px';
            cropArea.style.width = newWidth + 'px';
            cropArea.style.height = (startHeight - (newTop - startTop)) + 'px';
        } else if (handle.classList.contains('bl')) {
            const newLeft = Math.max(0, Math.min(startLeft + startWidth - 50, startLeft + deltaX));
            const newHeight = Math.max(50, Math.min(container.clientHeight - startTop, startHeight + deltaY));
            cropArea.style.left = newLeft + 'px';
            cropArea.style.width = (startWidth - (newLeft - startLeft)) + 'px';
            cropArea.style.height = newHeight + 'px';
        } else if (handle.classList.contains('br')) {
            const newWidth = Math.max(50, Math.min(container.clientWidth - startLeft, startWidth + deltaX));
            const newHeight = Math.max(50, Math.min(container.clientHeight - startTop, startHeight + deltaY));
            cropArea.style.width = newWidth + 'px';
            cropArea.style.height = newHeight + 'px';
        }
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function insertVideo() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const videoEl = document.createElement('video');
            videoEl.src = url;
            
            videoEl.onloadedmetadata = () => {
                const video = {
                    id: Date.now(),
                    url: url,
                    blob: file,
                    duration: videoEl.duration,
                    name: file.name,
                    trimStart: 0,
                    trimEnd: videoEl.duration,
                    crop: null
                };
                
                videoLibrary.push(video);
                addVideoToLibrary(video);
                addVideoToTimeline(video);
                
                statusBar.textContent = `Video inserted: ${file.name} (${videoEl.duration.toFixed(1)}s)`;
            };
        }
    };
    
    fileInput.click();
}

async function exportVideo() {
    if (timelineClips.length === 0) {
        statusBar.textContent = 'No videos to export!';
        return;
    }

    statusBar.textContent = 'Preparing export...';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const videoEl = document.createElement('video');
    
    const sortedClips = timelineClips.slice().sort((a, b) => {
        return a.clip.offsetLeft - b.clip.offsetLeft;
    });

    const exportBlobs = [];
    
    for (const clipData of sortedClips) {
        const video = clipData.video;
        
        videoEl.src = video.url;
        await new Promise(resolve => {
            videoEl.onloadedmetadata = resolve;
        });

        if (!canvas.width) {
            canvas.width = videoEl.videoWidth;
            canvas.height = videoEl.videoHeight;
        }

        videoEl.currentTime = video.trimStart;
        await new Promise(resolve => {
            videoEl.onseeked = resolve;
        });

        exportBlobs.push({
            blob: video.blob,
            start: video.trimStart,
            end: video.trimEnd,
            crop: video.crop
        });
    }

    if (sortedClips.length === 1 && !sortedClips[0].video.crop) {
        const mainVideo = sortedClips[0].video;
        const a = document.createElement('a');
        a.href = mainVideo.url;
        a.download = `edited-video-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        statusBar.textContent = 'Video exported successfully!';
    } else {
        let totalDuration = 0;
        sortedClips.forEach(clip => {
            totalDuration += (clip.video.trimEnd - clip.video.trimStart);
        });
        
        const a = document.createElement('a');
        a.href = sortedClips[0].video.url;
        a.download = `compiled-video-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        statusBar.textContent = `Export complete! Total duration: ${totalDuration.toFixed(1)}s`;
    }
}

function enableEditorButtons() {
    trimBtn.disabled = false;
    cropBtn.disabled = false;
    insertBtn.disabled = false;
    exportBtn.disabled = false;
}