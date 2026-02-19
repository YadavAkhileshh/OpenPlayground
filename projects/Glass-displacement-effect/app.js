import { Pane } from "https://cdn.skypack.dev/tweakpane@4.0.4";
import gsap from 'https://cdn.skypack.dev/gsap@3.13.0'
import Draggable from 'https://cdn.skypack.dev/gsap@3.13.0/Draggable'
gsap.registerPlugin(Draggable)

Draggable.create('.effect', {
  type: 'x,y',
})

Draggable.create('.effect2', {
  type: 'x,y',
})

Draggable.create('.effect3', {
  type: 'x,y',
})

const config = {
  theme: "light"
};

const ctrl = new Pane({
  title: "config",
  expanded: true
});

const update = () => {
  document.documentElement.dataset.theme = config.theme;
};

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== "theme"
  )
    return update();
  document.startViewTransition(() => update());
};

ctrl.addBinding(config, "theme", {
  label: "theme",
  options: {
    system: "system",
    light: "light",
    dark: "dark"
  }
});

ctrl.on("change", sync);
update();