// State
const state = {
	animations: ['fade', 'slide', 'slideUp', 'zoom', 'flipX', 'flipY'],
	view: 'slide'
}

// Controls
const controls = Vue.component('controls', {
  template: '#controls',
	data: state,
	methods: {
		setView(animation) {
			state.view = animation
		}
	}
})

// Transitions
const fade = Vue.component('fade', {
  template: '#page',
	methods: {
		enter(el, done) {
			TweenMax.fromTo(el, 1, {
				autoAlpha: 0,
				scale: 1.5,
			}, {
				autoAlpha: 1,
				scale: 1,
				transformOrigin: '50% 50%',
				ease: Power4.easeOut,
				onComplete: done
			});
		},
		leave(el, done) {
			TweenMax.fromTo(el, 1, {
				autoAlpha: 1,
				scale: 1,
			}, {
				autoAlpha: 0,
				scale: 0.8,
				ease: Power4.easeOut,
				onComplete: done
			});
		}
	}
})

const slide = Vue.component('slide', {
  template: '#page',
	methods: {
		enter(el, done) {
			const tl = new TimelineMax({
				onComplete: done
			})
			
			tl.set(el, {
				x: window.innerWidth * 1.5,
				scale: 0.8,
				transformOrigin: '50% 50%'
			})
			
			tl.to(el, 0.5, {
				x: 0,
				ease: Power4.easeOut
			});
			
			tl.to(el, 1, {
				scale: 1,
				ease: Power4.easeOut
			});
		},
		leave(el, done) {
			TweenMax.fromTo(el, 1, {
				autoAlpha: 1
			}, {
				autoAlpha: 0,
				ease: Power4.easeOut,
				onComplete: done
			});
		}	
	}
})

const slideUp = Vue.component('slideUp', {
  template: '#page',
	methods: {
		enter(el, done) {
			const tl = new TimelineMax({
				onComplete: done
			})
			
			tl.set(el, {
				y: window.innerWidth * 1.5,
				scale: 0.8,
				transformOrigin: '50% 50%'
			})
			
			tl.to(el, 0.5, {
				y: 0,
				ease: Power4.easeOut
			});
			
			tl.to(el, 1, {
				scale: 1,
				ease: Power4.easeOut
			});
		},
		leave(el, done) {
			TweenMax.to(el, 1, {
				y: window.innerHeight * -1.5,
				ease: Power4.easeOut,
				onComplete: done
			});
		}	
	}
})

const zoom = Vue.component('zoom', {
  template: '#page',
	methods: {
		enter(el, done) {
			const tl = new TimelineMax({
				onComplete: done
			})
			
			tl.set(el, {
				autoAlpha: 0,
				scale: 2,
				transformOrigin: '50% 50%'
			})
			
			tl.to(el, 1, {
				autoAlpha: 1,
				scale: 1,
				ease: Power4.easeOut
			})
		},
		leave(el, done) {
			TweenMax.to(el, 1, {
				scale: 0,
				ease: Power4.easeOut,
				onComplete: done
			});
		}	
	}
})

const flipX = Vue.component('flipX', {
  template: '#page',
	methods: {
		enter(el, done) {
			const tl = new TimelineMax({
				onComplete: done
			})
			
			tl.set(el, {
				autoAlpha: 0,
				rotationX: 90,
				transformOrigin: '50% 50%'
			})
			
			tl.to(el, 1, {
				autoAlpha: 1,
				rotationX: 0,
				ease: Power4.easeOut
			})
		},
		leave(el, done) {
			TweenMax.to(el, 1, {
				scale: 0,
				ease: Power4.easeOut,
				onComplete: done
			});
		}	
	}
})

const flipY = Vue.component('flipY', {
  template: '#page',
	methods: {
		enter(el, done) {
			const tl = new TimelineMax({
				onComplete: done
			})
			
			tl.set(el, {
				autoAlpha: 0,
				rotationY: 90,
				transformOrigin: '50% 50%'
			})
			
			tl.to(el, 1, {
				autoAlpha: 1,
				rotationY: 0,
				ease: Power4.easeOut
			})
		},
		leave(el, done) {
			TweenMax.to(el, 1, {
				scale: 0,
				ease: Power4.easeOut,
				onComplete: done
			});
		}	
	}
})

// App
const app = new Vue({
  el: '#app',
  data() {
		return state
	}
})