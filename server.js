/**
  Le Serveur HTTP.
  URL : http://[adresse IP/nom de domaine]:8888/

  Ce serveur produit une réponse HTTP contenant un document
  HTML suite à une requéte HTTP provenant d'un client HTTP.
**/

//chargement du module HTTP.
const http = require('http');

//création du serveur HTTP.
var httpServer = http.createServer();

//fonction qui produit la réponse HTTP.
var writeResponse = function writeHTTPResponse(HTTPResponse, responseCode, responseBody){
    HTTPResponse.writeHead(responseCode, {
      'Content-type':'text/html; charset=UTF-8',
      'Content-length':responseBody.length
    });
    HTTPResponse.write(responseBody, function(){
      HTTPResponse.end();
    });
};

//fonction qui produit une réponse HTTP contenant un message d'erreur 404 si le document HTML n'est pas trouvé.
var send404NotFound = function(HTTPResponse){
  writeResponse(HTTPResponse, 404, '<doctype html!><html><head>Page Not Found</head><body><h1>404: Page Not Found</h1><p>The requested URL could not be found</p></body></html>');
};

/**
  Gestion de l'événement 'request' : correspond à la gestion
  de la requête HTTP initiale permettant d'obtenir le fichier
  HTML contenant le code JavaScript utilisant l'API WebSocket.
**/
httpServer.on('request', function(HTTPRequest, HTTPResponse){
    //console.log('événement HTTP \'request\'.');
    var fs = require('fs');
    //le fichier HTML que nous utiliserons dans tous les cas.
    var filename = 'client.html';
    fs.access(filename, fs.R_OK, function(error){
      if(error){
        send404NotFound(HTTPResponse);
      }else{
        fs.readFile(filename, function(error, fileData){
            if(error){
              send404NotFound(HTTPResponse);
            }else{
              writeResponse(HTTPResponse, 200, fileData);
            }
        });
      }
    });
});

/**
  Le Serveur WebSocket associé au serveur HTTP.
  URL : ws://[adresse IP/nom de domaine]:8888/

  Ce serveur accepte une requête HTTP upgrade et établit
  une connexion persistante basée sur WebSocket.
**/

/**
  On installe et on utilise le package socket.io.
  La documentation est ici :
  - https://www.npmjs.com/package/socket.io
  - https://github.com/socketio/socket.io
  - http://socket.io/
**/
var socketIO = require('socket.io');

//  On utilise utilise la fonction obtenue avec notre serveur HTTP.
var socketIOWebSocketServer = socketIO(httpServer);

/**
  Gestion de l'événement 'connection' : correspond à la gestion
  d'une requête WebSocket provenant d'un client WebSocket.
**/
var tabScore = [{pseudo: 'DaBest', score: 6}];
var tabUser= [{pseudo: 'machin'}];
var tabPerso = [{id: 'lightblue50', color: 'lightblue', top: '50px'}, {id: 'green100', color: 'green', top: '100px'}, {id: 'yellow150', color: 'yellow', top: '150px'}, {id: 'blue200', color: 'blue', top: '200px'}, {id: 'pink250', color: 'pink', top: '250px'}, {id: 'grey300', color: 'grey', top: '300px'}, {id: 'lightgreen350', color: 'lightgreen', top: '350px'}, {id: 'white400', color: 'white', top: '400px'}];
var tabDispo = [{name: 'lightblue50', position: 50, enmove: false}, {name: 'green100', position: 50, enmove: false}, {name: 'yellow150', position: 50, enmove: false}, {name: 'blue200', position: 50, enmove: false}, {name: 'pink250', position: 50, enmove: false}, {name: 'grey300', position: 50, enmove: false}, {name: 'lightgreen350', position: 50, enmove: false}, {name: 'white400', position: 50, enmove: false}];
var toutLeMondeEstLa = 0;
var perdu = false;
socketIOWebSocketServer.on('connection', function (socket) {

  // socket : Est un objet qui représente la connexion WebSocket établie entre le client WebSocket et le serveur WebSocket.

  /**
    On attache un gestionnaire d'événement à un événement personnalisé 'unEvenement'
    qui correspond à un événement déclaré coté client qui est déclenché lorsqu'un message
    a été reçu en provenance du client WebSocket.
  **/
  // socket.on('disconnect', function() {
  //   console.log('Got disconnect!');
  //
  //   var i = tabUser.indexOf(socket);
  //   tabUser.splice(i, 1);
  // });
  //
  // socket.on('unEvenement', function (message) {
  //
  //   // Affichage du message reçu dans la console.
  //   console.log(message);
  //
  //   // Envoi d'un message au client WebSocket.
  //   socket.emit('unAutreEvenement', {texte: 'Message bien reçu !'});
  //   /**
  //     On déclare un événement personnalisé 'unAutreEvenement'
  //     dont la réception sera gérée coté client.
  //   **/
  //
  // });
  // var nbJoueur = 0;
  // switch (nbJoueur) {
  //   case 1:
  //     joueur.posy = '100px';
  //   break;
  //   case 2:
  //     joueur.posy = '200px';
  //   break;
  //   case 3:
  //     joueur.posy = '300px';
  //   break;
  //   case 4:
  //     joueur.posy = '400px';
  //   break;
  //   default:
  //
  // }

  var joueur = {};
  var perso;
  var taken = false;
  var trouve = false;

  socket.on('pseudo', function(pseudo){
    console.log('pseudo reçu');
    for (var i = 0; tabUser[i]; i++) {
      //console.log('dans la boucle');
      if(pseudo == tabUser[i].pseudo){
        taken = true;
        renvoiPseudo(taken);
        taken = false;
        break;
      };
      //
      if((i == tabUser.length - 1)){
        lancerlejeu(pseudo);
      };
    };
  });

  socket.on('rejouer', function(pseudo){
    lancerlejeu(pseudo);
  })

  var ai = function(){
    //TODO: pb avec l'ai qui envoie tous les bots ou un seul
    for (var i = 0; tabDispo[i]; i++) {
      var unseul = tabDispo[i];
      //setTimeout(function () {
        ind(unseul);
      //}, 100);
    };
  };

  var ind = function(bot){
    //console.log('bot', bot);
    var avance = Math.floor(Math.random() * 1000);
    if(avance == 0){
      bot.interval = setInterval(function () {
        bot.position += 10 ;
        if(bot.position >= 700){
          clearInterval(bot.interval);
          findepartie(bot.name);
        };
        if(bot.enmove == false){
          deplacement(bot.name);
          bot.enmove = true;
        };
        arretetoi(bot);
      }, 100);
    } else {
      ind(bot);
    };
  };

  var arretetoi = function(bot){
    console.log('arrete', bot.name);
    var arrete = Math.floor(Math.random() * 2);
    if(arrete == 0){
      console.log('doit s\'arreter', bot.name);
      clearInterval(bot.interval);
      bot.enmove = false;
      stoptout(bot.name);
      ind(bot);
    };
  };

  var lancerlejeu = function(pseudo){

    socket.emit('scores', tabScore);
    //console.log('pas pris server');
    renvoiPseudo(taken);
    toutLeMondeEstLa++;
    if(toutLeMondeEstLa >= 2){
      var ready = true;
      console.log('ready');
      socket.emit('ready', ready);
      socket.broadcast.emit('ready', ready);
      setTimeout(function () {
        //console.log('ai lancée');
        if(tabDispo.length === 6){
          ai();
        };
      }, 500);
    }

    var rand = tabDispo[Math.floor(Math.random() * tabDispo.length)].name;
    //console.log(rand);

    //supprime l'occurence du perso correspondant à rand dans la liste.
    for (var i = 0; tabDispo[i]; i++) {
      if(rand == tabDispo[i].name){
        tabDispo.splice(i, 1);
        //console.log(tabDispo);
        break;
      };
    };
    //envoi les bonnes infos à tout le monde
    //màj le tab des joueurs
    for (var i = 0; tabPerso[i]; i++) {
      if (tabPerso[i].id == rand) {
        //console.log(tabPerso[i].id, rand);
        joueur = {id: socket.id, perso: tabPerso[i], pseudo: pseudo, position: 50, interval: ''};
        socket.emit('message', joueur.perso);
        socket.emit('others', tabPerso);
        tabUser.push(joueur);
        //console.log(tabUser);
        break;
      };
    };
  };

  var renvoiPseudo = function(taken){
    socket.emit('taken', taken);
  };

  //socket.broadcast.emit('newPlayer', joueur.perso);

  // socket.on('premiere', function(joueur){
  //   //console.log(joueur);
  //   joueur.connect = socket.id;
  //   tabUser.push(joueur);
  //   console.log(tabUser);
  // });

  socket.on('touche', function(id){
    console.log('touche', id);
    socket.broadcast.emit('aterre', id);
  });

  var findepartie = function(vainqueur){
    for (var i = 0; tabPerso[i]; i++) {
      if(vainqueur === tabPerso[i].id){
        perdu = true;
      };
    };
    if(!perdu){
      for (var i = 0; tabScore[i]; i++) {
        if(vainqueur.pseudo == tabScore[i].pseudo){
          tabScore[i].score += 1;
          break;
        };
        if((i == tabScore.length -1)){
          //console.log('rentré dans le if');
          var res = {pseudo: vainqueur.pseudo, score: 1};
          tabScore.push(res);
          break;
        }
      };
      console.log('tab des scores', tabScore);
      var messageVainqueur = 'You win !<br> You\'re the BEST !';
      socket.emit('victory', messageVainqueur);
      var messagePerdant = vainqueur.pseudo + ' win ! <br> You LOSE !';
      socket.broadcast.emit('partieFinie', messagePerdant);
      console.log('victoire pour ' + vainqueur.pseudo);
    } else{
      var messageHumain = "Vous avez perdu contre des robots?"
      socket.emit('partieFinie', messageHumain);
      socket.broadcast.emit('partieFinie', messageHumain);
    };
    perdu = false;
    toutLeMondeEstLa = 0;
    tabUser= [{pseudo: 'machin'}];
    var tabDispo = [{name: 'lightblue50', position: 50, enmove: false}, {name: 'green100', position: 50, enmove: false}, {name: 'yellow150', position: 50, enmove: false}, {name: 'blue200', position: 50, enmove: false}, {name: 'pink250', position: 50, enmove: false}, {name: 'grey300', position: 50, enmove: false}, {name: 'lightgreen350', position: 50, enmove: false}, {name: 'white400', position: 50, enmove: false}];
  };

  socket.on('move', function(joueur){
    for (var i = 0; tabUser[i]; i++) {
      if(tabUser[i].id == socket.id){
        var user = tabUser[i];
        tabUser[i].interval = setInterval(function () {
          //console.log('user', user);
          user.position += 10 ;
          //console.log('position', user.position);
          if(user.position >= 700){
            clearInterval(user.interval);
            findepartie(user);
          }
        }, 100);
      };
    };
    //console.log(joueur, 'a bougé');
    //socket.broadcast.emit('start', joueur);
    //socket.emit('start', joueur);
    deplacement(joueur);
  });

  var deplacement = function(joueur){
    socket.broadcast.emit('start', joueur);
    socket.emit('start', joueur);
  };

  var stoptout = function(joueur){
    socket.broadcast.emit('stop', joueur);
    socket.emit('stop', joueur);
  };

  socket.on('end', function(joueur){
    for (var i = 0; tabUser[i]; i++) {
      if(tabUser[i].id == socket.id){
        clearInterval(tabUser[i].interval);
      };
    };
    //socket.broadcast.emit('stop', joueur);
    stoptout(joueur);
  });

  // socket.on('disconnect', function(){
  //   //console.log(socket);
  //   for (var i = 0; tabUser[i]; i++) {
  //     if (socket.id === tabUser[i].id){
  //       var gone = socket.id;
  //       socket.broadcast.emit('gone', gone);
  //       tabUser.splice(i, 1);
  //     };
  //   };
  // });

});

httpServer.listen(8888);
