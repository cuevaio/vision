"use client";

import * as React from "react";
import Webcam from "react-webcam";

const PUBLISHABLE_ROBOFLOW_API_KEY = "rf_BK8M3fRL4HghorGPIF3Xos6TtlB2";
const PROJECT_URL = "https://universe.roboflow.com/cuevaio/barranco-movement";
const MODEL_VERSION = "3";

export const Roboflow = () => {
  const webcamRef = React.useRef<Webcam>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [inferRunning, setInferRunning] = React.useState<boolean>(false);

  const roboflowRef = React.useRef<any>(null);
  const roboflow = roboflowRef.current;

  React.useEffect(() => {
    if (roboflowRef.current) return;

    // check if roboflow is available every 1 second
    const interval = setInterval(() => {
      // @ts-ignore
      if (window.roboflow) {
        // @ts-ignore
        roboflowRef.current = window.roboflow;
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const detect = React.useCallback(async (model: any) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      adjustCanvas(videoWidth, videoHeight);

      const detections = await model.detect(webcamRef.current.video);

      const ctx = canvasRef.current?.getContext("2d");
      drawBoxes(detections, ctx);
    }
  }, []);

  React.useEffect(() => {
    if (inferRunning) return;
    setInferRunning(true);

    if (!roboflow) return;

    roboflow
      .auth({
        publishable_key: PUBLISHABLE_ROBOFLOW_API_KEY,
      })
      .load({
        model: PROJECT_URL,
        version: MODEL_VERSION,
        onMetadata: function (m: any) {
          console.log("model loaded");
        },
      })
      .then((model: any) => {
        setInterval(() => {
          if (inferRunning) detect(model);
        }, 10);
      });
  }, [roboflow, inferRunning, detect]);

  const adjustCanvas = (w: number, h: number) => {
    if (!canvasRef.current) return;

    canvasRef.current.width = w * window.devicePixelRatio;
    canvasRef.current.height = h * window.devicePixelRatio;

    canvasRef.current.style.width = w + "px";
    canvasRef.current.style.height = h + "px";

    const ctx = canvasRef.current.getContext("2d");
    if (ctx !== null) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  };

  const drawBoxes = (detections: any, ctx: any) => {
    ctx.clearRect(0, 0, canvasRef.current?.width, canvasRef.current?.height);
    detections.forEach((row: any) => {
      if (true) {
        //video
        var temp = row.bbox;
        temp.class = row.class;
        temp.color = row.color;
        temp.confidence = row.confidence;
        row = temp;
      }

      if (row.confidence < 0) return;

      //dimensions
      var x = row.x - row.width / 2;
      var y = row.y - row.height / 2;
      var w = row.width;
      var h = row.height;

      //box
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = row.color;
      ctx.rect(x, y, w, h);
      ctx.stroke();

      //shade
      ctx.fillStyle = "black";
      ctx.globalAlpha = 0.2;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1.0;

      //label
      var fontColor = "black";
      var fontSize = 12;
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "center";
      var classTxt = row.class;
      var confTxt = (row.confidence * 100).toFixed().toString() + "%";
      var msgTxt = classTxt + " " + confTxt;
      const textHeight = fontSize;
      var textWidth = ctx.measureText(msgTxt).width;

      if (textHeight <= h && textWidth <= w) {
        ctx.strokeStyle = row.color;
        ctx.fillStyle = row.color;
        ctx.fillRect(
          x - ctx.lineWidth / 2,
          y - textHeight - ctx.lineWidth,
          textWidth + 2,
          textHeight + 1
        );
        ctx.stroke();
        ctx.fillStyle = fontColor;
        ctx.fillText(msgTxt, x + textWidth / 2 + 1, y - 1);
      } else {
        textWidth = ctx.measureText(confTxt).width;
        ctx.strokeStyle = row.color;
        ctx.fillStyle = row.color;
        ctx.fillRect(
          x - ctx.lineWidth / 2,
          y - textHeight - ctx.lineWidth,
          textWidth + 2,
          textHeight + 1
        );
        ctx.stroke();
        ctx.fillStyle = fontColor;
        ctx.fillText(confTxt, x + textWidth / 2 + 1, y - 1);
      }
    });
  };

  return (
    <>
      <Webcam
        ref={webcamRef}
        muted={true}
        className="absolute mx-auto left-0 right-0 text-center z-10"
      />
      <canvas
        ref={canvasRef}
        className="absolute mx-auto left-0 right-0 text-center z-20"
      />
    </>
  );
};
