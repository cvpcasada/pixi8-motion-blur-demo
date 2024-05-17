import { useLayoutEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import * as PIXI from "pixi.js";
import {
  MotionBlurFilter,
  MotionBlurFilterOptions,
} from "pixi-filters/motion-blur";

import { Vector2, centerVec2 } from "./helpers";
import { bindAll, mitt } from "@cyca/utils/mitt";
import { useControls } from "leva";

const $ = mitt<{
  updateFilter: MotionBlurFilterOptions;
  updateViewportPosition: Vector2;
  updateObjectPosition: Vector2;
}>();

function App() {
  let [renderer, setRenderer] =
    useState<PIXI.AutoDetectOptions["preference"]>("webgpu");

  useControls({
    renderer: {
      options: ["webgpu", "webgl"],
      value: renderer,
      onChange: (value) => setRenderer(value),
    },
  });

  useControls({
    kernelSize: {
      value: 15,
      max: 25,
      min: 0,
      step: 5,
      onChange: (value) => {
        $.emit("updateFilter", { kernelSize: value });
      },
    },
  });

  useControls({
    kernelSize: {
      value: 15,
      max: 25,
      min: 0,
      step: 5,
      onChange: (value) => {
        $.emit("updateFilter", { kernelSize: value });
      },
    },
  });

  useControls({
    velocity: {
      value: { x: 40, y: 40 },
      max: 90,
      min: -90,
      onChange: (value) => {
        $.emit("updateFilter", { velocity: value });
      },
    },
  });

  useControls({
    offset: {
      value: 0,
      max: 150,
      min: -150,
      step: 1,
      onChange: (value) => {
        $.emit("updateFilter", { offset: value });
      },
    },
  });

  return <PixiApp preference={renderer} />;
}

function PixiApp(props: Partial<PIXI.ApplicationOptions>) {
  let options = useMemo(
    () =>
      ({
        width: window.innerWidth,
        height: window.innerHeight,
        autoStart: false,
        backgroundColor: 0x000000,
        clearBeforeRender: true,
        preference: "webgl",
        hello: true,
        resizeTo: window,
        ...props,
      } as PIXI.ApplicationOptions),
    [props]
  );

  useLayoutEffect(() => {
    let appInitialized = false;
    let abort = new AbortController();
    let dom = canvasContainer.current;
    let app = new PIXI.Application();
    let unsub = () => {};

    function buildStage() {
      let template = new PIXI.Graphics();
      template
        .star(0, 0, 5, 100)
        .fill(0xff0000)
        .stroke({ color: 0xffffff, width: 6 });

      // let objectToBlur = new PIXI.Sprite(createRenderTexture(template, app.renderer));
      // template.destroy();
      let filter = new MotionBlurFilter({
        velocity: { x: 40, y: 40 },
        offset: 0,
        kernelSize: 15,
      });

      let objectToBlur = template;

      // container
      let viewport = new PIXI.Container();
      // viewport.interactive = true;
      // viewport.hitArea = app.renderer.screen;

      viewport.addChild(objectToBlur);

      // viewport.on("click", (e) => {
      //   filter.velocity.x = [Math.random() * 10 - 5, Math.random() * 10 - 5];
      // });

      app.stage.addChild(viewport);
      app.stage.filters = [filter];

      //position stuff
      // objectCenter({  width: objectToBlur.width, height: objectToBlur.height });
      objectToBlur.position.set(
        ...centerVec2(
          { width: app.renderer.width, height: app.renderer.height },
          [0, 0]
        )
      );

      unsub = bindAll($, {
        updateFilter: (filterParams) => {
          Object.assign(filter, filterParams);
          app.render();
        },
      });
    }

    new Promise((resolve, reject) => {
      abort.signal.addEventListener("abort", reject);
      app.init(options).then(resolve, reject);
    })
      .then(buildStage)
      .then(() => {
        app.render();
        dom?.appendChild(app.canvas);
        appInitialized = true;
      })
      .catch(() => {});

    globalThis.__PIXI_APP__ = app;

    return () => {
      abort.abort();
      unsub();

      if (appInitialized) {
        dom!.removeChild(app.canvas);
        app.destroy();
      }
    };
  }, [options]);

  let canvasContainer = useRef<HTMLDivElement>(null);

  return (
    <div ref={canvasContainer} />
  );
}

export default App;

function createRenderTexture(
  template: PIXI.Container,
  renderer: PIXI.Renderer
) {
  let { width: maxX, height: maxY } = template;
  // let { maxX, maxY } = template.getBounds(true); // pixi-8

  // Draw the circle to the RenderTexture
  let renderTexture = PIXI.RenderTexture.create({
    width: Math.floor(maxX),
    height: Math.floor(maxY),
    antialias: true, // pixi-8
  });

  // With the existing renderer, render texture
  // make sure to apply a transform Matrix

  // pixi-8
  renderer.render({
    target: renderTexture,
    container: template,
  });

  return renderTexture;
}
