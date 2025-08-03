function magnify(imgID, zoom) {
  var glass, img, w, h, bw, parent, timg;
  img = document.querySelector("#viewer>div>div.openseadragon-canvas>canvas");
  // parent = document.querySelector('#viewer>div>div.openseadragon-canvas');
  glass = document.getElementById("mag");
  view = document.getElementById(imgID);

  // var viewerHandler = function() {
  //   glass.viewport.zoomTo(view.viewport.getZoom());
  //   glass.viewport.panTo(view.viewport.getCenter());
  // };
  //
  // view.addEventListener('zoom', viewerHandler);
  // view.addEventListener('pan', viewerHandler);
  // glass.setAttribute("class", "img-magnifier-glass hide");
  // glass.setAttribute("id", "magnifier");
  // parent.insertBefore(glass, img);
  /*set background properties for the magnifier glass:*/
  // glass.style.backgroundImage = "url('" + img.toDataURL("image/png") + "')";
  // glass.style.backgroundRepeat = "no-repeat";
  // glass.style.backgroundSize = (img.width * zoom) + "px " + (img.height * zoom) + "px";
  bw = 3;
  w = glass.offsetWidth / 2;
  h = glass.offsetHeight / 2;
  /*execute a function when someone moves the magnifier glass over the image:*/
  // glass.addEventListener("mousemove", moveMagnifier);
  view.addEventListener("mousemove", moveMagnifier);
  /*and also for touch screens:*/
  // glass.addEventListener("touchmove", moveMagnifier);
  view.addEventListener("touchmove", moveMagnifier);

  function moveMagnifier(e) {
    // console.log("move");
    var pos, x, y;
    /*prevent any other actions that may occur when moving over the image*/
    e.preventDefault();
    /*get the cursor's x and y positions:*/
    pos = getCursorPos(e);
    x = pos.x;
    y = pos.y;
    /*prevent the magnifier glass from being positioned outside the image:*/
    if (x > img.width - w / zoom) {
      x = img.width - w / zoom;
    }
    if (x < w / zoom) {
      x = w / zoom;
    }
    if (y > img.height - h / zoom) {
      y = img.height - h / zoom;
    }
    if (y < h / zoom) {
      y = h / zoom;
    }
    /*set the position of the magnifier glass:*/
    glass.style.left = x - w + "px";
    glass.style.top = y - h + "px";
    /*display what the magnifier glass "sees":*/
    // glass.style.backgroundPosition =
    //   "-" + (x * zoom - w + bw) + "px -" + (y * zoom - h + bw) + "px";
  }
  function getCursorPos(e) {
    let a, x, y;
    e = e || window.event;
    /*get the x and y positions of the image:*/
    a = img.getBoundingClientRect();
    /*calculate the cursor's x and y coordinates, relative to the image:*/
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    /*consider any page scrolling:*/
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return { x: x, y: y };
  }
}
