// Mask Function from https://github.com/processing/p5.js/issues/3900

p5.Graphics.prototype.mask = function (inputMask) {

  if (inputMask === undefined) {
    inputMask = this;
  }
  const currBlend = this.drawingContext.globalCompositeOperation;

  let scaleFactor = 1;
  if (inputMask instanceof p5.Renderer) {
    scaleFactor = inputMask._pInst._pixelDensity;
  }

  const copyArgs = [
    inputMask,
    0,
    0,
    scaleFactor * inputMask.width,
    scaleFactor * inputMask.height,
    0,
    0,
    this.width,
    this.height
  ];

  this.drawingContext.globalCompositeOperation = 'destination-in';
  p5.Renderer2D.prototype.copy.apply(this, copyArgs);
  this.drawingContext.globalCompositeOperation = currBlend;

}


// The sketch in p5 "instance mode": nothing runs until a page starts it with
//   new p5(p => sketch(p, base), holder)
// p is this running copy of p5, so p5 functions and variables are p.createCanvas, p.mouseX, etc.
// base is the URL of the folder holding assets/, e.g. "/sketches/time-in-place/",
// so the images load from the right place whichever page the sketch runs on.
// The page also needs an element with id="loc" for the location caption.
function sketch(p, base = "") {

  const folderNames = ["01DoylesWest", "02doyles", "05HardwickeZoom",
    "06StGeorgesChurch", "07DorsetSt", "08KeanesCt", "09DenmarkPl",
    "11RiddalsRow", "12RiddallsRow", "13AngelseaMarket", "14MooreSt"];
  const captions = ["Doyles Corner, looking west", "Doyles Corner, looking north", "Hardwicke Street towards St George's Church",
    "St George's Church from Dorset Street", "Dorset Street", "Keanes Court, now Church Ave", "Denmark Place, now Ilac Centre",
    "Riddalls Row, now Ilac Centre", "Riddalls Row, now Ilac Centre", "Angelsea Market, now Ilac Centre", "Moore Street"];
  const fileImageFront = "F.jpg";
  const fileImageBack = "B.jpg";
  let frontImages = new Array();
  let backImages = new Array();
  let frontImage;
  let backImage;

  let iImage = 0;  // index of folder
  let thisMilli = 0;  // counts of last image load
  const duration = 10000;  // milliseconds for each image

  const headerHeight = 150;  // pixels buffer for header, just to estimate scaling
  const hwRatioTarget = 0.75;  // height to width ratio for image
  let hwRatio;
  let xOffset;
  let thisWidth;
  let thisHeight;

  let graphic;
  let mask;
  let loc;

  p.preload = function () {
    for (let index = 0; index < folderNames.length; index++) {
      backImages.push(p.loadImage(base + "assets/" + folderNames[index] + "/" + fileImageBack));
      frontImages.push(p.loadImage(base + "assets/" + folderNames[index] + "/" + fileImageFront));
    }
  };

  p.setup = function () {
    loc = document.getElementById("loc");

    let graphicWidth = p.windowWidth;
    let graphicHeight = p.windowHeight - headerHeight;
    let hwRatioWindow = graphicHeight / graphicWidth;
    if (hwRatioWindow > hwRatioTarget) {
      // use full width
      graphicHeight = p.floor(graphicWidth * hwRatioTarget);
    } else {
      // use full height
      graphicWidth = p.floor(graphicHeight / hwRatioTarget);
    }
    // In instance mode p5 puts the canvas inside the holder element it was started with
    p.createCanvas(graphicWidth, graphicHeight);

    // start the circle in the middle, until the mouse moves
    p.mouseX = p.width / 2;
    p.mouseY = p.height / 2;

    graphic = p.createGraphics(p.width, p.height);
    mask = p.createGraphics(p.width, p.height);
    mask.noStroke();

    nextImage();
  };

  p.draw = function () {
    p.clear();
    p.image(frontImage, xOffset, 0, thisWidth, thisHeight);
    graphic.clear();
    graphic.image(backImage, xOffset, 0, thisWidth, thisHeight);

    let m = p.millis();
    if (m - thisMilli > duration) {
      thisMilli = m;
      iImage = (iImage + 1) % folderNames.length;
      nextImage();
    }

    mask.clear();
    let circleSize = p.width / 3;
    let circleCenterX = p.max(p.min(p.mouseX, xOffset + thisWidth), xOffset);
    let circleCenterY = p.max(p.min(p.mouseY, thisHeight), 0);
    mask.ellipse(circleCenterX, circleCenterY, circleSize, circleSize);

    graphic.mask(mask);
    p.image(graphic, 0, 0, p.width, p.height);

    if (loc) loc.textContent = captions[iImage];
  };

  p.keyPressed = function () {
    if (p.keyCode === p.LEFT_ARROW) {
      iImage = (folderNames.length + iImage - 1) % folderNames.length;
    } else if (p.keyCode === p.RIGHT_ARROW) {
      iImage = (iImage + 1) % folderNames.length;
    }

    thisMilli = p.millis();
    nextImage();
  };

  function nextImage() {
    backImage = backImages[iImage];
    frontImage = frontImages[iImage];
    hwRatio = backImage.height / backImage.width;

    if (hwRatio <= hwRatioTarget) {
      // use full width
      thisWidth = p.width;
      thisHeight = p.width * hwRatio;
      xOffset = 0;
    } else {
      // use full height
      thisWidth = p.height / hwRatio;
      thisHeight = p.height;
      xOffset = (p.width - thisWidth) / 2;
    }
  }
}
