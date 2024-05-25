"use client";

import { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { useScreen } from "usehooks-ts";
import { useStore } from "@/lib/store";

const PUBLISHABLE_ROBOFLOW_API_KEY = "rf_BK8M3fRL4HghorGPIF3Xos6TtlB2";

const MODEL_NAME = "barranco-movement";
const MODEL_VERSION = "3";

export const Roboflow = () => {
  const { height } = useScreen();
  const { addDetection } = useStore();

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  var inferRunning;
  var model;

  const startInfer = () => {
    inferRunning = true;
    window.roboflow
      .auth({
        publishable_key: PUBLISHABLE_ROBOFLOW_API_KEY,
      })
      .load({
        model: MODEL_NAME,
        version: MODEL_VERSION,
        onMetadata: function (m) {
          console.log("model loaded");
        },
      })
      .then((model) => {
        setInterval(() => {
          if (inferRunning) detect(model);
        }, 100);
      });
  };

  useEffect(startInfer, []);

  // const stopInfer = () => {
  //     inferRunning = false;
  //     if (model) model.teardown();
  // };

  const detect = async (model) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      adjustCanvas(videoWidth, videoHeight);

      const detections = await model.detect(webcamRef.current.video);

      const maxConfidence = detections.reduce(
        (max, detection) => Math.max(max, detection.confidence),
        0
      );

      if (maxConfidence > 0.8) {
        console.log(detections);
        const ctx = canvasRef.current.getContext("2d");
        drawBoxes(detections, ctx);
      }

      if (maxConfidence > 0.9) {
        detections.forEach((row) => {
          if (row.confidence > 0.9) {
            addDetection({
              detClass: row.class,
              confidence: row.confidence,
            });
          }
        });
      }
    }
  };

  const adjustCanvas = (w, h) => {
    canvasRef.current.width = w * window.devicePixelRatio;
    canvasRef.current.height = h * window.devicePixelRatio;

    canvasRef.current.style.width = w + "px";
    canvasRef.current.style.height = h + "px";

    canvasRef.current
      .getContext("2d")
      .scale(window.devicePixelRatio, window.devicePixelRatio);
  };

  const drawBoxes = (detections, ctx) => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    detections.forEach((row) => {
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

  const extractFrame = () => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Create a new canvas with the same dimensions as the video.
      const canvas = document.createElement("canvas");
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Draw the current frame from the video onto the canvas.
      const ctx = canvas.getContext("2d");
      ctx.drawImage(webcamRef.current.video, 0, 0, videoWidth, videoHeight);

      // Convert the canvas image to Data URL
      const dataURL = canvas.toDataURL();

      // Now you can use dataURL as the source for an Image element
      const img = new Image();
      img.src = dataURL;

      // Or download it as an image file
      const a = document.createElement("a");
      a.href = dataURL;
      a.download = "frame.png";
      a.click();
    }
  };

  return (
    <div
      className="rounded-lg overflow-hidden border relative"
      style={{
        width: (height * 0.5 * 3) / 4,
        height: height * 0.5,
      }}
    >
      <Webcam
        ref={webcamRef}
        muted={true}
        className="absolute mx-auto left-0 right-0 text-center z-10"
        videoConstraints={{
          height: height * 0.5,
          width: (height * 0.5 * 3) / 4,
          facingMode: "environment",
        }}
        height={height * 0.5}
        width={(height * 0.5 * 3) / 4}
      />
      <canvas
        ref={canvasRef}
        className="absolute mx-auto left-0 right-0 text-center z-20"
        width={(height * 0.5 * 3) / 4}
        height={height}
      />
    </div>
  );
};
