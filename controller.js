/**
 * Copyright (c) 2012 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 **/


// Checking for "chrome.app.runtime" availability allows this Chrome app code to
// be tested in a regular web page (like tests/manual.html). Checking for
// "chrome" and "chrome.app" availability further allows this code to be tested
// in non-Chrome browsers, which is useful for example to test touch support
// with a non-Chrome touch device.
if (typeof chrome !== 'undefined' && chrome.app && chrome.app.runtime) {
 
 var myContentWindow;
 var res;

  var showCalculatorWindow = function () { 
    chrome.app.window.create('cryptick.html', {
      defaultWidth: 400, minWidth: 200, maxWidth: 4000,
      defaultHeight: 61, minHeight: 61, maxHeight: 61,
      id: 'cryptick'
    },
     function(appWindow) {
      appWindow.contentWindow.onload = function() {

        myContentWindow = appWindow.contentWindow;
        new Controller(  );
      };

      chrome.storage.local.set({windowVisible: true});

       appWindow.onMaximized.addListener(function() {
        //make height largest
        console.log("maximized");
      });

        appWindow.onRestored.addListener(function() {
        //make height largest
        console.log("restored");
      });

      appWindow.onClosed.addListener(function() {
        chrome.storage.local.set({windowVisible: false});
        console.log("closed window");
      });

      appWindow.contentWindow.onresize=function() {
     if (res){clearTimeout(res)};
     res = setTimeout(function(){windowResized();},100);
        };


    });
  }






  chrome.app.runtime.onLaunched.addListener(showCalculatorWindow);
  chrome.app.runtime.onRestarted.addListener(function() {
    chrome.storage.local.get('windowVisible', function(data) {
      if (data.windowVisible)
        showCalculatorWindow();
    });
  });
}



var myMarkets = new Array("ALF/BTC","AMC/BTC","ANC/BTC","ARG/BTC","BTB/BTC","BTE/BTC",
  "BTG/BTC","BQC/BTC","CSC/BTC","CAP/BTC","COL/LTC","CLR/BTC","CMC/BTC","CRC/BTC",
  "CPR/LTC","ELC/BTC","EMD/BTC","FST/BTC","FRC/BTC","GLX/BTC",
  "GLC/BTC","GME/LTC","GLD/BTC","GDC/BTC","IFC/LTC","HBN/BTC","LTC/BTC","MEC/BTC","MNC/BTC",
  "FTC/BTC","NMC/BTC","PPC/BTC","PXC/BTC","PYC/BTC","QRK/BTC","SBC/BTC","SPT/BTC","SRC/BTC",
  "TAG/BTC","TRC/BTC","WDC/BTC","XPM/BTC","YAC/BTC","ZET/BTC");

//var storedDisabledMarkets = new Array();




function Controller() {

registerListeners();

//loadStoredOptions();

 
chrome.alarms.onAlarm.addListener(onAlarm);


chrome.alarms.create('connect', {periodInMinutes: 1} );
  //setInterval(connect(window),2000);


    myScrollContainer = myContentWindow.document.getElementById("scroller");
 




chrome.storage.sync.get('storedDisabledMarkets', function(data) {
      if (data.storedDisabledMarkets){
            
              for(var d=0;d<data.storedDisabledMarkets.length;d++){
            
                    disableMarketBanner(data.storedDisabledMarkets[d]);  
                }

        }



  while (myScrollContainer.hasChildNodes()) {//remove init text
       myScrollContainer.removeChild(myScrollContainer.lastChild);
      }

      



   initBanners(myScrollContainer);
   loadOtherBanners(myScrollContainer);

  connect();
    
   addMarqueeCode();//must always be called after the divs are changed!!
    
     


    });



}

function registerListeners(){

var button = myContentWindow.document.getElementById("toggleOptionsButton");

myOptionsContainer = myContentWindow.document.getElementById("optionsContainer");
 initOptionsContainer();


 $(button).click(function(){
      toggleOptionsWindow();
  });       

}

var myOptionButtons = new Array();
function initOptionsContainer(){
 
 for (var i=0; i< myMarkets.length; i++){
 myOptionButtons[i] = document.createElement("div");
  myOptionButtons[i].setAttribute('class', 'hideBannerOption');
   myOptionButtons[i].innerHTML =  myMarkets[i] ;

  $(myOptionButtons[i]).click(function(){
           
         optionToggled( $( this ) );
   });  


    myOptionsContainer.appendChild(myOptionButtons[i]);
  }

  //populate
$(myOptionsContainer).hide();
}


function optionToggled(data){
   if( data[0].getAttribute('class') == 'hideBannerOption' ){
   
   disableMarketBanner(data[0].innerHTML);
  }else{
   
   enableMarketBanner(data[0].innerHTML);
  }

}


var myOptionsContainer;
var showingOptions = false;
function toggleOptionsWindow(){
   

  if(showingOptions){
     showingOptions=false;
     $(myScrollContainer).show();
     $(myOptionsContainer).hide();

      //refresh 
      refreshEntireTicker();

  }else{
    showingOptions=true;
     $(myScrollContainer).hide(); 
     $(myOptionsContainer).show();
  }

 
}


function enableMarketBanner(label){


for(var i=0;i<myOptionButtons.length;i++){
  if(myOptionButtons[i].innerHTML == label){
      myOptionButtons[i].setAttribute('class', 'hideBannerOption');
  }
}



chrome.storage.sync.set({'storedDisabledMarkets': getDisabledMarkets() });
}

function disableMarketBanner(label){


for(var i=0;i<myOptionButtons.length;i++){
  if(myOptionButtons[i].innerHTML == label){
      myOptionButtons[i].setAttribute('class', 'hideBannerOptionDisabled');
  }
}

chrome.storage.sync.set({'storedDisabledMarkets': getDisabledMarkets() });

}








function windowResized(){//need to refresh everything here!
console.log("window resized");
refreshEntireTicker();
}

function refreshEntireTicker(){//need to refresh everything here!
firstExecution = true;


//var myScrollContainer = myContentWindow.document.getElementById("scroller");

 while (myScrollContainer.hasChildNodes()) {
    myScrollContainer.removeChild(myScrollContainer.lastChild);
}


  initBanners(myScrollContainer);
   loadOtherBanners(myScrollContainer);
      
   updateExistingBanners(currentMarketData,myScrollContainer);
   updateCoinbaseBanner();

 addMarqueeCode();
}

var firstExecution = true;
function addMarqueeCode(){




    //$(myScrollContainer).liScroll();

  firstExecution=false;


 //  $(myScrollContainer).simplyScroll(); //DO NOT HACK LIKE THIS

 
//$(myScrollContainer).hide();

//$(myScrollContainer).fadeIn( "fast", function() {
  
    $(myScrollContainer).simplyScroll({
          pauseOnHover: true,   //causes isssues when true
          //customClass: 'custom',
          numItems: (myMarkets.length + 1),
          speed: 3
    });

 // });







}


function onAlarm(alarm) {
  console.log('Got alarm', alarm);
  

  if (alarm && alarm.name == 'connect') {
    connect();
  } 


}



 function updateMarketBanner(market,oldmarket,originalNode){


      //  var vol =  (parseInt(market.volume)).toExponential(2);

      var lastTrade = market.recenttrades[0];
      


        var priceColor = "#FFFFFF";
        var miscData = null;
       

          if(oldmarket){
                var oldLastTrade =  oldmarket.recenttrades[0];


              miscData = getPercentDifference(lastTrade.price,oldLastTrade.price);
               

            if( lastTrade.price > oldLastTrade.price  ){//if price jumped
              console.log("price jumped "+ market.label);
             // lastprice.style.backgroundColor = "#AA0000";
              priceColor = "#CCFFCC";
            }else if( lastTrade.price < oldLastTrade.price  ){//if price fell
              console.log("price fell " + market.label);
              priceColor = "#FFCCCC";
            } else{
                priceColor = "#FFFFFF";
            }

          }
          
          var linkURL= "https://www.cryptsy.com/markets/view/"+market.marketid;

          var quantity = shortenQuantity(lastTrade.quantity);
       

        updateGenericBanner(originalNode,market.primaryname, lastTrade.price, priceColor, quantity ,miscData,linkURL);

 }

function shortenQuantity(rawamount){
  //like 3k, 5M,  etc etc
  return rawamount;
}



 function updateGenericBanner(originalNode,primaryName,price,priceColor,quantity,miscData,linkURL){


          var icon = originalNode.querySelectorAll(".icon")[0];
         
      
         var lastprice =  originalNode.querySelectorAll(".lastpricelabel")[0];         
         lastprice.innerHTML =  price; //update

        var misc =  originalNode.querySelectorAll(".volumelabel")[0];
         if(miscData){
            misc.innerHTML =  miscData; 
         }
         
          originalNode.style.background = priceColor;  


       var fullname = originalNode.querySelectorAll(".fullnamelabel")[0];      
         fullname.innerHTML =  primaryName; 





          if(linkURL && firstExecution){//only passed in on first update
            console.log("ADDING HYPERLINK FUNCTION");
          $(originalNode).click(function(){
                 window.open(linkURL);
            });        
         }



           $(originalNode).mouseenter(function(){
          originalNode.style.background = "#78cff5";
            });

            $(originalNode).mouseleave(function(){
          originalNode.style.background = priceColor;
            });



            var foregroundColor = "#000000";


           // if(priceColor == "#FFFFFF"){         

              //if(parseFloat(misc.innerHTML.slice(0, - 1) ) > 0){
              if((misc.innerHTML).substring(0,1) == "+"){
                 icon.setAttribute('src', 'uparrow.png');
                 if(priceColor == "#FFFFFF"){
                 foregroundColor="#229922";
                 }
              }
            //if(parseFloat(misc.innerHTML.slice(0, - 1)  ) < 0){
             if((misc.innerHTML).substring(0,1) == "-"){
                icon.setAttribute('src', 'downarrow.png');
                 if(priceColor == "#FFFFFF"){
                foregroundColor="#992222";
                 }
              }

           // }

           
            lastprice.style.color = foregroundColor;
             misc.style.color = foregroundColor;
          
         

 }

 function createGenericBanner(label,primaryname,price,priceColor,vol,linkURL,parentNode){
        var ban = document.createElement("li");         
         ban.setAttribute('class', 'ban');
          ban.setAttribute('marketlabel', label);  //so we can easily edit, not destroy everything
          ban.setAttribute('fullnamelabel', primaryname);  //so we can easily edit, not destroy everything

         var container = document.createElement("div");         
         container.setAttribute('class', 'contain');

        var tophalf = document.createElement("div");         
        tophalf.setAttribute('class', 'tophalf');


         var name = document.createElement("div");
          name.setAttribute('class', 'namelabel');
         name.innerHTML =  label ;
          tophalf.appendChild(name);

         var fullname = document.createElement("div");
           fullname.setAttribute('class', 'fullnamelabel');
         fullname.innerHTML =  primaryname; 
          tophalf.appendChild(fullname);

           container.appendChild(tophalf);


        var icon = document.createElement("img");
           icon.setAttribute('class', 'icon');
           container.appendChild(icon);

          var lastprice = document.createElement("div");
           lastprice.setAttribute('class', 'lastpricelabel');         
         lastprice.innerHTML =  price ;
          container.appendChild(lastprice);


       var volume = document.createElement("div");
           volume.setAttribute('class', 'volumelabel');           
         volume.innerHTML =  vol; 
          container.appendChild(volume);


          ban.style.background = priceColor;




          if(linkURL){
          $(ban).click(function(){
          window.open(linkURL);
            });        
          }

         

            $(ban).mouseenter(function(){
          ban.style.background = "#78cff5";
            });

                 $(ban).mouseleave(function(){
          ban.style.background = priceColor;
            });


         // lastprice.style.color = priceColor;
      
         

        ban.appendChild(container);

        parentNode.appendChild(ban);

         console.log("creating banner!");
        return ban;
 }
/*
 function visitURL(linkurl){
window.open(linkurl);

 }*/

function appendMarketData(market,parentNode){

       parentNode.innerHTML +=  market.lasttradeprice ;        

 }





//var cryptsyBanners=new Array();

var currentMarketData;
var oldMarketData;



function initBanners(myScrollContainer){


    for (var i=0; i< myMarkets.length; i++){
      if(marketIsDisabled(myMarkets[i])){

        continue;
      }
          
          var oldmarket;

          if(oldMarketData){
           oldmarket =  oldMarketData[ myMarkets[i] ];
          }

          createGenericBanner(myMarkets[i],"","",null,"",null,myScrollContainer);

     }


}


function marketIsDisabled(label){

  for(var i=0; i< myOptionButtons.length; i++){
      if(myOptionButtons[i].innerHTML == label){
       if(myOptionButtons[i].getAttribute('class') == 'hideBannerOptionDisabled'){
        // console.log("found match" + label);
       // console.log("disabled");

        console.log("found disabled market "+ label); //does not work right off the bat :(
        return true;
       }
      }
  }

    console.log("market enabled "+ label);
  return false;
}

var myScrollContainer;
function connect(){
 
 console.log("connecting to json data");



  //grab cryptsy info
$.ajax({
     url: 'http://pubapi.cryptsy.com/api.php?method=marketdatav2',
     dataType: 'json', // Notice! JSONP <-- P (lowercase)
     //method: 'getmarkets',
     success:function(json){

      console.log("connected to json data");

      oldMarketData = currentMarketData;
      currentMarketData = json.return.markets;

        

      updateExistingBanners(currentMarketData,myScrollContainer);
      

     },
     error:function(){
         alert("Error getting data");
     },
});

 connectToCoinbase();

}


function updateExistingBanners(marketData,myScrollContainer){

  
     var allBanners = myScrollContainer.childNodes;  //even picks up the darn clones!

            //for(var i = 0; i < cryptsyBanners.length ; i++){//kept in same order as market array :)
   for (var m=0; m< myMarkets.length; m++){
         for(var b=0;b<allBanners.length;b++){
                      
             if(allBanners[b].getAttribute('marketlabel') == marketData[ myMarkets[m] ].label ){
        
             
               var oldmarket;
               if(oldMarketData){
                 oldmarket =  oldMarketData[ myMarkets[m] ];
               }

              updateMarketBanner(marketData[ myMarkets[m] ],oldmarket, allBanners[b] );
            }
          }
        }
           // }


}

function loadOtherBanners(myScrollContainer){
        

    createGenericBanner("BTC/USD","(Coinbase)", "" ,"#FFFFFF","","https://www.coinbase.com", myScrollContainer );
       

    createGenericBanner("BTC/USD","(MtGox)", "" ,"#FFFFFF","","https://www.mtgox.com", myScrollContainer );
      

       console.log("created bitcoin banners");


}


var currentCoinbaseData;
var oldCoinbaseData;

var currentMtGoxData;
var oldMtGoxData;

function connectToCoinbase(){


$.ajax({
     url: 'https://coinbase.com/api/v1/currencies/exchange_rates',
     dataType: 'json',

     success:function(data){
      

      oldCoinbaseData = currentCoinbaseData;
      currentCoinbaseData = data;


       updateCoinbaseBanner();
              
                           
     },
     error:function(){
         alert("Error getting data");
     },
});


$.ajax({
     url: 'http://data.mtgox.com/api/2/BTCUSD/money/ticker_fast',
     dataType: 'json',

     success:function(data){

      oldMtGoxData = currentMtGoxData;
      currentMtGoxData = data;


       updateMtGoxBanner();
              
                           
     },
     error:function(){
         alert("Error getting data");
     },
});




}


function updateCoinbaseBanner(){

  var allBanners = myScrollContainer.childNodes;  //even picks up the darn clones!

            //for(var i = 0; i < cryptsyBanners.length ; i++){//kept in same order as market array :)
  
         for(var b=0;b<allBanners.length;b++){         
             if(allBanners[b].getAttribute('fullnamelabel') == "(Coinbase)"){

                 //update coinbase banner
               var miscData = null;
              var priceColor = "#FFFFFF";
              if(oldCoinbaseData){

                   if( currentCoinbaseData.btc_to_usd > oldCoinbaseData.btc_to_usd  ){//if price jumped
                          priceColor = "#CCFFCC";
                  }else if( currentCoinbaseData.btc_to_usd < oldCoinbaseData.btc_to_usd  ){//if price fell
                         priceColor = "#FFCCCC";
                   } else{
                        priceColor = "#FFFFFF";
                  }

                  miscData = getPercentDifference(currentCoinbaseData.btc_to_usd,oldCoinbaseData.btc_to_usd);

              }

               var coinbasePrice = Math.round(currentCoinbaseData.btc_to_usd * 1000) / 1000;
               var quantity = shortenQuantity(1);

              updateGenericBanner( allBanners[b],"(Coinbase)",coinbasePrice,priceColor,quantity,miscData,"https://www.coinbase.com"  );

              //pdateGenericBanner(originalNode,primaryName,price,priceColor,miscData,linkURL){
            }
          }

}

function updateMtGoxBanner(){

  var allBanners = myScrollContainer.childNodes;  //even picks up the darn clones!

            //for(var i = 0; i < cryptsyBanners.length ; i++){//kept in same order as market array :)
  
         for(var b=0;b<allBanners.length;b++){         
             if(allBanners[b].getAttribute('fullnamelabel') == "(MtGox)"){

            

                 //update coinbase banner
               var miscData = null;
              var priceColor = "#FFFFFF";
              if(oldMtGoxData){


                    //someimes the back is red but the icon is green... ???? HOW
                   if( currentMtGoxData.data.last.value > oldMtGoxData.data.last.value  ){//if price jumped
                          priceColor = "#CCFFCC";
                  }else if( currentMtGoxData.data.last.value < oldMtGoxData.data.last.value  ){//if price fell
                         priceColor = "#FFCCCC";
                   } else{
                        priceColor = "#FFFFFF";
                  }

                  miscData = getPercentDifference(currentMtGoxData.data.last.value,oldMtGoxData.data.last.value);

              }

               var price = Math.round(currentMtGoxData.data.last.value * 1000) / 1000;
               var quantity = shortenQuantity(1); 

                console.log("found  mtgox"+b);
                console.log(price);

              updateGenericBanner( allBanners[b],"(MtGox)",price,priceColor,quantity,miscData,"https://www.mtgox.com"  );

              //pdateGenericBanner(originalNode,primaryName,price,priceColor,miscData,linkURL){
            }
          }

}

function getPercentDifference(currentPrice, oldPrice){


                var oldPrice = parseFloat(oldPrice);
                var currentPrice  = parseFloat(currentPrice); 
                var diff = currentPrice - oldPrice;

             
                var percentDifference = diff / oldPrice;

                percentDifference = Math.round(percentDifference * 10000) / 100;

                  
                if(percentDifference > 0){
                  return ("+"+ percentDifference + "%");
                }else if(percentDifference < 0){
                  return (percentDifference + "%");
                }else{
                  return (null);
                }
                


}

function getDisabledMarkets(){
    var answer = new Array();

 for (var i=0; i< myMarkets.length; i++){
      if(marketIsDisabled(myMarkets[i])){
        answer.push(myMarkets[i]);
      }
    }

    return answer;
}

/** @private */
Controller.prototype.getUpdatedValue_ = function(before, after, key, zero) {
  var value = (typeof after[key] !== 'undefined') ? after[key] : before[key];
  return zero ? (value || '0') : value;
}
