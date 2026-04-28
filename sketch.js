// ============================================================
//  PoseNet + ML5.js  互動藝術 — sketch.js
//  需搭配 index.html 使用
// ============================================================

let video, poseNet, pose, skeleton;
let rightEarImg = null;        // 沒有圖片時為 null，程式不會出錯
let useEarImage = false;       // 改成 true 並放入 right_ear.png 才會顯示

// ── 預載圖片（只有 useEarImage 為 true 才載入）──────────────
function preload() {
  if (useEarImage) {
    rightEarImg = loadImage("right_ear.png");
  }
}

// ── 初始化 ───────────────────────────────────────────────────
function setup() {
  createCanvas(640, 480);
  // createCanvas(windowWidth, windowHeight); // 全螢幕版本

  video = createCapture(VIDEO);
  video.hide();

  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
}

// ── 模型就緒回呼 ─────────────────────────────────────────────
function modelLoaded() {
  console.log('poseNet ready');
}

// ── 姿勢資料回呼 ─────────────────────────────────────────────
function gotPoses(poses) {
  if (poses.length > 0) {
    pose     = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

// ── 主繪圖迴圈 ───────────────────────────────────────────────
function draw() {
  background(0);

  // 攝影機畫面鏡像修正
  translate(video.width, 0);
  scale(-1, 1);

  image(video, 0, 0);

  if (pose) {
    // ── 鼻子圓圈（直徑 = 兩眼距離）────────────────────────
    let eyeR = pose.rightEye;
    let eyeL = pose.leftEye;
    let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
    fill(255, 0, 0);
    noStroke();
    ellipse(pose.nose.x, pose.nose.y, d);

    // ── 手腕圓圈 ─────────────────────────────────────────
    fill(0, 0, 255);
    ellipse(pose.rightWrist.x, pose.rightWrist.y, 62);
    ellipse(pose.leftWrist.x,  pose.leftWrist.y,  62);

    // ── 關鍵點 & 骨架 ────────────────────────────────────
    drawKeypoints();
    drawSkeleton();

    // ── 右耳貼圖（需要 useEarImage = true 且圖片存在）────
    if (useEarImage && rightEarImg && pose.rightEar.confidence > 0.7) {
      push();
        translate(pose.rightEar.x, pose.rightEar.y);
        imageMode(CENTER);
        scale(-1, 1);
        scale(0.1);
        image(rightEarImg, 0, 0);
      pop();
    }
  }
}

// ── 畫出所有關鍵點 ───────────────────────────────────────────
function drawKeypoints() {
  fill(0, 255, 0);
  noStroke();
  for (let i = 0; i < pose.keypoints.length; i++) {
    let x = pose.keypoints[i].position.x;
    let y = pose.keypoints[i].position.y;
    ellipse(x, y, 16, 16);
  }
}

// ── 畫出骨架線段 ─────────────────────────────────────────────
function drawSkeleton() {
  strokeWeight(2);
  stroke(255, 0, 0);
  noFill();
  for (let i = 0; i < skeleton.length; i++) {
    let a = skeleton[i][0];
    let b = skeleton[i][1];
    line(a.position.x, a.position.y, b.position.x, b.position.y);
  }
}