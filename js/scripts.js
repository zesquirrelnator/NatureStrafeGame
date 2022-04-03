/*!
* Start Bootstrap - Creative v7.0.6 (https://startbootstrap.com/theme/creative)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
*/
//
// Scripts
// 
$('#originalJoin').show();




let map, infoWindow;


const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const snapSoundElement = document.getElementById('snapSound');
const webcam = new Webcam(webcamElement, 'user', canvasElement, snapSoundElement);
GameCodeLength = Cookies.get("gameCode").length;


if(GameCodeLength != 0 && Cookies.get("isPlaying") == "false" && $('#loadingSection').is(':hidden')){
    setInterval(function(){
            $.ajax({url: "https://us-central1-naturestrafe.cloudfunctions.net/app/join?gameCode=" + $('#gameCode').val() + "&name=" + $('#nameTag').val(), type: 'GET', success: async function(res) {
        
                }   
            });
    }, 10000);
}

if($('#GameMap').is(':visible')){
    setInterval(function(){
        if(Cookies.get("isPlaying") == "true"){
            $('#originalJoin').hide();
            $('#loadingSection').hide();
            $('#GameMap').show();
            $('#CountDown').show();
            $('#PointCount').show();
            initMap();
        } 
    }, 10000);
}

function Leave(){
    $.ajax({url: "https://us-central1-naturestrafe.cloudfunctions.net/app/leave?gameCode=" + Cookies.get("gameCode") + "&name=" + Cookies.get("name"), type: 'GET', success: async function(res) {
            Cookies.remove("isPlaying")
            Cookies.remove("Latitude")
            Cookies.remove("Longitude")
            Cookies.remove("gameCode")
            Cookies.remove("name")
            $('#originalJoin').show();
            $('#loadingSection').hide();
            $('#GameMap').hide();
            $('#camera').hide();
            $('#CountDown').hide();
            $('#PointCount').hide();
            }   
        });
}
 
function CenterControl(controlDiv, map) {
    // Set CSS for the control border.
    const controlUI = document.createElement("div");
  
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "2px solid #fff";
    controlUI.style.borderRadius = "3px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
    controlUI.style.marginTop = "8px";
    controlUI.style.marginBottom = "22px";
    controlUI.style.textAlign = "center";
    controlUI.title = "Click to recenter the map";
    controlDiv.appendChild(controlUI);
  
    // Set CSS for the control interior.
    const controlText = document.createElement("div");
  
    controlText.style.color = "rgb(25,25,25)";
    controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    controlText.style.fontSize = "16px";
    controlText.style.lineHeight = "38px";
    controlText.style.paddingLeft = "5px";
    controlText.style.paddingRight = "5px";
    controlText.innerHTML = "Take Picture";
    controlUI.appendChild(controlText);
    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener("click", () => {
        let picture = webcam.snap();
        var image = new Image();
        image.src = picture;

        cocoSsd.load()
        .then(model => model.detect(image))
        .then(predictions => {
            console.log(JSON.stringify(predictions[0].class))
            $.ajax({url: "https://us-central1-naturestrafe.cloudfunctions.net/app/uploadImageToServer?picture=" + image + "&gameCode=" + Cookies.get("gameCode") + "&name=" + Cookies.get("name") + "&lat=" + Cookies.get("latitude") + "&lng=" + Cookies.get("longitude") + "&prediction=" + JSON.stringify(predictions[0].class), type: 'GET', success: async function(res) {

                }   
            });
        })
        
    });
}
function RightControl(controlDiv, map) {
    // Set CSS for the control border.
    const controlUI = document.createElement("div");
  
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "2px solid #fff";
    controlUI.style.borderRadius = "3px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
    controlUI.style.marginTop = "8px";
    controlUI.style.marginRight = "8px";

    controlUI.style.marginBottom = "22px";
    controlUI.style.textAlign = "center";
    controlUI.title = "Click to recenter the map";
    controlDiv.appendChild(controlUI);
  
    // Set CSS for the control interior.
    const controlText = document.createElement("div");

    controlText.style.color = "rgb(25,25,25)";
    controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    controlText.style.fontSize = "16px";
    controlText.style.lineHeight = "38px";
    controlText.style.right = "50px";
    controlText.innerHTML = "Leave";
    controlUI.appendChild(controlText);
    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener("click", () => {
        Leave();
    });
}
  
  



function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
}

function initMap() {

    const map = new google.maps.Map(document.getElementById("GameMap"), {
      zoom: 15,
      center: { lat: -34.397, lng: 150.644 },
      disableDefaultUI: true
    });

    const image = {
        url: "/Frontend/assets/img/currentLocation.png",
        size: new google.maps.Size(300, 300),
        anchor: new google.maps.Point(20, 30),
    }
    infoWindow = new google.maps.Marker({
        map,
        draggable: false, 
        icon: image,
    });

    const centerControlDiv = document.createElement("div");
    const RightControlDiv = document.createElement("div");

    RightControl(RightControlDiv, map);
    CenterControl(centerControlDiv, map);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(RightControlDiv);


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            Cookies.set("latitude", pos.lat);
            Cookies.set("longitude", pos.lng);

            $.ajax({url: "https://us-central1-naturestrafe.cloudfunctions.net/app/getOtherLocations?gameCode=" + Cookies.get('gameCode') + "&name=" + Cookies.get("name") + "&lat=" + pos.lat + "&lng=" + pos.lng, type: 'GET', success: async function(res) {
                tempList = 1;
                res.userData.forEach((doc) => {
                    new google.maps.Marker({
                        center: { lat: doc.lat, lng: doc.lng },
                        draggable: false, 
                        icon: image,
                    });
                });
                $('#CountDown').show();
                $('#PointCount').show();
                if((res.points).length > 0 || (res.points).length != null){
                    document.getElementById("PointCount").innerText = "Points: " + res.points;

                }
                else{
                    document.getElementById("PointCount").innerText = "Points: " + '0';

                }

            }
        });
  
            infoWindow.setPosition(pos);
            map.setCenter(pos);
          },
          () => {
            handleLocationError(true, infoWindow, map.getCenter());
          }
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }  

   
}
      
    

  

function playGame(){
    $.ajax({url: "https://us-central1-naturestrafe.cloudfunctions.net/app/playGame?gameCode=" + Cookies.get('gameCode'), type: 'GET', success: async function(res) {
            if(res.isPlaying = true){
                Cookies.set('isPlaying', 'true');
                $('#originalJoin').hide();
                $('#loadingSection').hide();
                $('#GameMap').show();
                $('#camera').show();
                $('#CountDown').show();
                $('#PointCount').show();
                webcam.start()
                .then(result =>{
                    console.log("webcam started");
                })
                .catch(err => {
                    console.log(err);
                }); 
            }
            
        }
    });
}

function gameJoin(a){   

    if(a == 2 && ($('#gameCode').val()).length > 0){
        $.ajax({url: "https://us-central1-naturestrafe.cloudfunctions.net/app/join?gameCode=" + $('#gameCode').val() + "&name=" + $('#nameTag').val(), type: 'GET', success: async function(res) {
                if(res.isPlaying = true){
                    Cookies.set('isPlaying', 'true');
                }
                else{
                    Cookies.set('isPlaying', 'false');

                }
                Cookies.set('gameCode', res.gameCode);
                Cookies.set('name', $('#nameTag').val());

                $('#originalJoin').hide();
                var playerArray = res.userData;
                arrayLength = playerArray.length;

                for (i = 0; i < arrayLength; i++) {
                $('<div style="background-color:rgb(130, 86, 171); text-align:center; opacity: 0.8; border-radius: 20%; width: 100%; height: 5%; margin: 10px;"><h5/></div>').text(playerArray[i].id).appendTo('#loadingSection');
                }
                $('#loadingSection').show();
            }
        });
    }
    if(a != 2 && ($('#gameCode').val()).length == 0){
        console.log("creating");
        $.ajax({url: "https://us-central1-naturestrafe.cloudfunctions.net/app/create?name=" + $('#nameTag').val(), type: 'GET', success: async function(res) {
                Cookies.set('isPlaying', 'false');
                Cookies.set('gameCode', res.gameCode);
                Cookies.set('name', $('#nameTag').val());
                $('#originalJoin').hide();
                var playerArray = res.userData;
                arrayLength = playerArray.length;
                
                for (i = 0; i < arrayLength; i++) {
                  $('<div style="background-color:rgb(130, 86, 171); text-align:center; opacity: 0.8; border-radius: 20%; width: 100%; height: 5%; margin: 10px;"><h5/></div>').text(playerArray[i].id).appendTo('#loadingSection');
                }
                $('#loadingSection').show();
            }
        });
    }
}




//Not Important code

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Activate SimpleLightbox plugin for portfolio items
    new SimpleLightbox({
        elements: '#portfolio a.portfolio-box'
    });

});
