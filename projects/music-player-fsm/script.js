        (function() {
            // ---------- MUSIC PLAYER FSM ----------
            const MusicFSM = {
                states: {
                    STOPPED: 'STOPPED',
                    PLAYING: 'PLAYING',
                    PAUSED: 'PAUSED'
                },
                
                current: 'STOPPED',
                
                // Playlist data
                playlist: [
                    { title: 'Bohemian Rhapsody', artist: 'Queen', duration: 355 }, // 5:55
                    { title: 'Stairway to Heaven', artist: 'Led Zeppelin', duration: 482 }, // 8:02
                    { title: 'Hotel California', artist: 'Eagles', duration: 390 }, // 6:30
                    { title: 'Imagine', artist: 'John Lennon', duration: 184 }, // 3:04
                    { title: 'Smells Like Teen Spirit', artist: 'Nirvana', duration: 301 } // 5:01
                ],
                
                currentTrackIndex: 0,
                currentTime: 0, // seconds
                
                // Playback modes
                repeatMode: 'none', // 'none', 'one', 'all'
                shuffleMode: false,
                shuffleOrder: [], // shuffled indices
                
                // Timer for playback simulation
                timer: null,
                
                // Transition table
                transitions: {
                    'STOPPED_PLAY': 'PLAYING',
                    'STOPPED_NEXT': 'STOPPED',   // stays stopped, changes track
                    'STOPPED_PREV': 'STOPPED',
                    'STOPPED_STOP': 'STOPPED',    // already stopped
                    
                    'PLAYING_PAUSE': 'PAUSED',
                    'PLAYING_STOP': 'STOPPED',
                    'PLAYING_NEXT': 'PLAYING',     // changes track, stays playing
                    'PLAYING_PREV': 'PLAYING',
                    'PLAYING_TRACK_END': 'PLAYING', // handles next track, might stop if end
                    
                    'PAUSED_PLAY': 'PLAYING',
                    'PAUSED_STOP': 'STOPPED',
                    'PAUSED_NEXT': 'PAUSED',       // change track while paused
                    'PAUSED_PREV': 'PAUSED'
                },
                
                dispatch(event, data = null) {
                    const from = this.current;
                    const key = `${from}_${event}`;
                    
                    if (this.transitions.hasOwnProperty(key)) {
                        return this.transitions[key];
                    }
                    return from;
                },
                
                send(event, data = null) {
                    const before = this.current;
                    const after = this.dispatch(event, data);
                    const changed = before !== after;
                    
                    this.current = after;
                    
                    return { changed, from: before, to: after };
                },
                
                // Playback control methods
                play() {
                    if (this.current === 'STOPPED' && this.playlist.length === 0) return;
                    
                    const result = this.send('PLAY');
                    
                    if (result.changed && this.current === 'PLAYING') {
                        this.startTimer();
                    }
                    
                    return result;
                },
                
                pause() {
                    const result = this.send('PAUSE');
                    
                    if (result.changed && this.current === 'PAUSED') {
                        this.stopTimer();
                    }
                    
                    return result;
                },
                
                stop() {
                    const result = this.send('STOP');
                    
                    if (result.changed) {
                        this.stopTimer();
                        this.currentTime = 0;
                    }
                    
                    return result;
                },
                
                next() {
                    const prevIndex = this.currentTrackIndex;
                    
                    if (this.shuffleMode) {
                        // Get next in shuffle order
                        const currentPos = this.shuffleOrder.indexOf(this.currentTrackIndex);
                        if (currentPos < this.shuffleOrder.length - 1) {
                            this.currentTrackIndex = this.shuffleOrder[currentPos + 1];
                        } else {
                            // End of shuffle order
                            if (this.repeatMode === 'all') {
                                // Restart shuffle
                                this.shuffleOrder = this.generateShuffleOrder();
                                this.currentTrackIndex = this.shuffleOrder[0];
                            } else {
                                // Stop at end
                                this.stop();
                                this.send('NEXT'); // update state
                                return;
                            }
                        }
                    } else {
                        // Normal next
                        if (this.currentTrackIndex < this.playlist.length - 1) {
                            this.currentTrackIndex++;
                        } else {
                            // End of playlist
                            if (this.repeatMode === 'all') {
                                this.currentTrackIndex = 0; // loop to start
                            } else {
                                this.stop();
                                this.send('NEXT');
                                return;
                            }
                        }
                    }
                    
                    this.currentTime = 0;
                    this.send('NEXT');
                    
                    // If we were playing, continue playing new track
                    if (this.current === 'PLAYING') {
                        this.startTimer();
                    }
                },
                
                prev() {
                    if (this.currentTime > 3) {
                        // If more than 3 seconds into track, restart track
                        this.currentTime = 0;
                    } else {
                        // Go to previous track
                        if (this.shuffleMode) {
                            const currentPos = this.shuffleOrder.indexOf(this.currentTrackIndex);
                            if (currentPos > 0) {
                                this.currentTrackIndex = this.shuffleOrder[currentPos - 1];
                            } else {
                                // At start of shuffle
                                if (this.repeatMode === 'all') {
                                    this.currentTrackIndex = this.shuffleOrder[this.shuffleOrder.length - 1];
                                } else {
                                    // Stay on current
                                    this.currentTime = 0;
                                }
                            }
                        } else {
                            if (this.currentTrackIndex > 0) {
                                this.currentTrackIndex--;
                            } else {
                                // At first track
                                if (this.repeatMode === 'all') {
                                    this.currentTrackIndex = this.playlist.length - 1;
                                } else {
                                    this.currentTime = 0;
                                }
                            }
                        }
                    }
                    
                    this.currentTime = 0;
                    this.send('PREV');
                    
                    if (this.current === 'PLAYING') {
                        this.startTimer();
                    }
                },
                
                // Timer for playback simulation
                startTimer() {
                    if (this.timer) clearInterval(this.timer);
                    
                    this.timer = setInterval(() => {
                        if (this.current !== 'PLAYING') return;
                        
                        this.currentTime += 0.1;
                        
                        // Check if track ended
                        const currentTrack = this.playlist[this.currentTrackIndex];
                        if (this.currentTime >= currentTrack.duration) {
                            this.trackEnded();
                        }
                        
                        updateUI();
                    }, 100);
                },
                
                stopTimer() {
                    if (this.timer) {
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                },
                
                trackEnded() {
                    if (this.repeatMode === 'one') {
                        // Repeat current track
                        this.currentTime = 0;
                        this.send('TRACK_END');
                    } else {
                        // Go to next track
                        this.next();
                    }
                    updateUI();
                },
                
                // Shuffle functions
                generateShuffleOrder() {
                    const indices = Array.from({ length: this.playlist.length }, (_, i) => i);
                    for (let i = indices.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [indices[i], indices[j]] = [indices[j], indices[i]];
                    }
                    return indices;
                },
                
                toggleShuffle() {
                    this.shuffleMode = !this.shuffleMode;
                    
                    if (this.shuffleMode) {
                        this.shuffleOrder = this.generateShuffleOrder();
                        // Ensure current track is in shuffle order
                        if (!this.shuffleOrder.includes(this.currentTrackIndex)) {
                            this.shuffleOrder.unshift(this.currentTrackIndex);
                        }
                    }
                },
                
                toggleRepeat() {
                    const modes = ['none', 'one', 'all'];
                    const currentIndex = modes.indexOf(this.repeatMode);
                    this.repeatMode = modes[(currentIndex + 1) % modes.length];
                },
                
                selectTrack(index) {
                    if (index >= 0 && index < this.playlist.length) {
                        this.currentTrackIndex = index;
                        this.currentTime = 0;
                        
                        // If playing, continue playing new track
                        if (this.current === 'PLAYING') {
                            this.startTimer();
                        }
                    }
                },
                
                formatTime(seconds) {
                    const mins = Math.floor(seconds / 60);
                    const secs = Math.floor(seconds % 60);
                    return `${mins}:${secs.toString().padStart(2, '0')}`;
                }
            };

            // ---------- DOM Elements ----------
            const albumArt = document.getElementById('albumArt');
            const nowPlayingTrack = document.getElementById('nowPlayingTrack');
            const nowPlayingArtist = document.getElementById('nowPlayingArtist');
            const currentTimeSpan = document.getElementById('currentTime');
            const totalTimeSpan = document.getElementById('totalTime');
            const progressFill = document.getElementById('progressFill');
            const playerState = document.getElementById('playerState');
            const modeIndicator = document.getElementById('modeIndicator');
            const repeatMode = document.getElementById('repeatMode');
            const shuffleMode = document.getElementById('shuffleMode');
            
            // Playlist items
            const track1 = document.getElementById('track1');
            const track2 = document.getElementById('track2');
            const track3 = document.getElementById('track3');
            const track4 = document.getElementById('track4');
            const track5 = document.getElementById('track5');
            const playlistItems = [track1, track2, track3, track4, track5];
            
            // Control buttons
            const playPauseBtn = document.getElementById('playPauseBtn');
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const stopBtn = document.getElementById('stopBtn');
            
            const btnPlay = document.getElementById('btnPlay');
            const btnPause = document.getElementById('btnPause');
            const btnStop = document.getElementById('btnStop');
            const btnNext = document.getElementById('btnNext');
            const btnPrev = document.getElementById('btnPrev');
            const btnShuffle = document.getElementById('btnShuffle');
            const btnRepeat = document.getElementById('btnRepeat');
            const btnReset = document.getElementById('btnReset');

            // Update UI
            function updateUI() {
                const state = MusicFSM.current;
                const track = MusicFSM.playlist[MusicFSM.currentTrackIndex];
                const currentTime = MusicFSM.currentTime;
                const totalTime = track.duration;
                
                // Update now playing info
                nowPlayingTrack.innerText = track.title;
                nowPlayingArtist.innerText = track.artist;
                currentTimeSpan.innerText = MusicFSM.formatTime(currentTime);
                totalTimeSpan.innerText = MusicFSM.formatTime(totalTime);
                
                // Update progress bar
                const progressPercent = (currentTime / totalTime) * 100;
                progressFill.style.width = progressPercent + '%';
                
                // Update state
                playerState.innerText = state;
                
                // Update play/pause icon
                playPauseBtn.innerText = state === 'PLAYING' ? '⏸️' : '▶️';
                
                // Update mode indicators
                modeIndicator.innerText = state;
                repeatMode.innerText = `🔁 REPEAT: ${MusicFSM.repeatMode.toUpperCase()}`;
                shuffleMode.innerText = `🔀 SHUFFLE: ${MusicFSM.shuffleMode ? 'ON' : 'OFF'}`;
                
                // Update album art animation
                if (state === 'PLAYING') {
                    albumArt.classList.add('playing');
                } else {
                    albumArt.classList.remove('playing');
                }
                
                // Update playlist active item
                playlistItems.forEach((item, index) => {
                    if (index === MusicFSM.currentTrackIndex) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
                
                // Update button states
                updateButtons();
            }
            
            function updateButtons() {
                const state = MusicFSM.current;
                
                // Basic control buttons are always enabled
                // But we might disable based on playlist length etc.
                const hasTracks = MusicFSM.playlist.length > 0;
                
                // No buttons are truly disabled, but we'll keep them all enabled
                // for maximum interaction
            }
            
            // Event handlers
            function handlePlay() {
                MusicFSM.play();
                updateUI();
            }
            
            function handlePause() {
                MusicFSM.pause();
                updateUI();
            }
            
            function handleStop() {
                MusicFSM.stop();
                updateUI();
            }
            
            function handleNext() {
                MusicFSM.next();
                updateUI();
            }
            
            function handlePrev() {
                MusicFSM.prev();
                updateUI();
            }
            
            function handlePlayPause() {
                if (MusicFSM.current === 'PLAYING') {
                    handlePause();
                } else {
                    handlePlay();
                }
            }
            
            function handleShuffle() {
                MusicFSM.toggleShuffle();
                updateUI();
            }
            
            function handleRepeat() {
                MusicFSM.toggleRepeat();
                updateUI();
            }
            
            function handleReset() {
                MusicFSM.stop();
                MusicFSM.currentTrackIndex = 0;
                MusicFSM.currentTime = 0;
                MusicFSM.repeatMode = 'none';
                MusicFSM.shuffleMode = false;
                MusicFSM.shuffleOrder = [];
                updateUI();
            }
            
            function handleTrackSelect(index) {
                return function() {
                    MusicFSM.selectTrack(index);
                    updateUI();
                };
            }
            
            // Initialize
            function init() {
                MusicFSM.current = 'STOPPED';
                MusicFSM.currentTrackIndex = 0;
                MusicFSM.currentTime = 0;
                updateUI();
                
                // Button listeners
                playPauseBtn.addEventListener('click', handlePlayPause);
                prevBtn.addEventListener('click', handlePrev);
                nextBtn.addEventListener('click', handleNext);
                stopBtn.addEventListener('click', handleStop);
                
                btnPlay.addEventListener('click', handlePlay);
                btnPause.addEventListener('click', handlePause);
                btnStop.addEventListener('click', handleStop);
                btnNext.addEventListener('click', handleNext);
                btnPrev.addEventListener('click', handlePrev);
                btnShuffle.addEventListener('click', handleShuffle);
                btnRepeat.addEventListener('click', handleRepeat);
                btnReset.addEventListener('click', handleReset);
                
                // Playlist listeners
                track1.addEventListener('click', handleTrackSelect(0));
                track2.addEventListener('click', handleTrackSelect(1));
                track3.addEventListener('click', handleTrackSelect(2));
                track4.addEventListener('click', handleTrackSelect(3));
                track5.addEventListener('click', handleTrackSelect(4));
            }
            
            init();
        })();