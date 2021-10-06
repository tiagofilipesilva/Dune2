// Generated by CoffeeScript 1.8.0
Epicport.API = (function() {
  function API(options) {
    var Module, progress, self, status;
    self = this;
    this.canvas = new Epicport.Canvas(options);
    this.game = options.game;
    this.audio = new Audio();
    this.audio.volume = 0.5;
    this.files = [];
    status = document.getElementById("status");
    progress = $("#progress");
    progress.progressbar({
      value: 0
    });
    Module = {
      "arguments": options["arguments"],
      screenIsReadOnly: true,
      preRun: [
        function() {
          if (options.preRun) {
            options.preRun();
          }
          return Epicport.API.createFs();
        }
      ],
      postRun: [],
      print: (function() {
        return function(text) {
          return console.log(text);
        };
      })(),
      printErr: function(text) {
        text = Array.prototype.slice.call(arguments).join(" ");
        return console.log(text);
      },
      canvas: this.canvas.el(),
      setStatus: function(text) {
        var m;
        if (Module.setStatus.interval) {
          clearInterval(Module.setStatus.interval);
        }
        m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
        if (m) {
          text = m[1];
          Epicport.API.progress(parseInt(m[2]) * 100, parseInt(m[4]) * 100);
        }
        status.innerHTML = text;
        if (text === '') {
          return self.canvas.hideOverlay();
        }
      },
      totalDependencies: 0,
      monitorRunDependencies: function(left) {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        return Module.setStatus((left ? "Preparing... (" + (this.totalDependencies - left) + "/" + this.totalDependencies + ")" : "All downloads complete."));
      }
    };
    Module.setStatus("Loading...");
    this.Module = Module;
  }

  API.prototype.progress = function(value, max) {
    var progress;
    progress = $("#progress");
    progress.progressbar("option", "value", value);
    return progress.progressbar("option", "max", max);
  };

  API.prototype.module = function() {
    return this.Module;
  };

  API.prototype.canSave = function() {
    if (Epicport.profile) {
      return true;
    }
    Epicport.login({
      callback: function() {
        if (Epicport.profile) {
          Epicport.API.createFs();
          return Epicport.modalMessage(Epicport.i18n.html_login_success_title, Epicport.i18n.html_can_save_desc);
        }
      }
    });
    return false;
  };

  API.prototype.canLoad = function() {
    if (Epicport.profile) {
      return true;
    }
    Epicport.login({
      callback: function() {
        if (Epicport.profile) {
          Epicport.API.createFs();
          return Epicport.modalMessage(Epicport.i18n.html_login_success_title, Epicport.i18n.html_can_load_desc);
        }
      }
    });
    return false;
  };

  API.prototype.selectLoadFileDialog = function(extensionPtr, callback, hideFileInputField) {
    return Epicport.API.selectFileDialog(extensionPtr, callback, true);
  };

  API.prototype.selectSaveFileDialog = function(extensionPtr, callback, hideFileInputField) {
    return Epicport.API.selectFileDialog(extensionPtr, callback, false);
  };

  API.prototype.selectFileDialog = function(extensionPtr, callback, hideFileInputField) {
    var buttons, cancelButton, extension, file, filename, files, okButton, success, _i, _len;
    extension = Module['Pointer_stringify'](extensionPtr);
    if (hideFileInputField) {
      $('.select-file-input').hide();
    } else {
      $('.select-file-input').show();
    }
    $('#select-file-dialog-file').val("");
    files = Epicport.API.files;
    if (files.length) {
      $(".select-file-dialog ul").empty();
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        filename = file.substring(file.lastIndexOf('/') + 1);
        $(".select-file-dialog ul").append("<li>" + filename + "</li>");
      }
    }
    $(".select-file-dialog ul > li").off('click');
    $(".select-file-dialog ul > li").click(function(e) {
      success($(e.target).html());
      return $(".select-file-dialog").dialog('close');
    });
    if (!(typeof Module === 'undefined')) {
      Module['disable_sdl_envents'] = true;
    }
    success = function(filename) {
      if (!Epicport.API.selectFileDialogPtr) {
        Epicport.API.selectFileDialogPtr = Module['_malloc'](128);
      }
      Module['writeStringToMemory'](filename, Epicport.API.selectFileDialogPtr);
      Module['dunCall']('vi', callback, [Epicport.API.selectFileDialogPtr]);
      if (!(typeof Module === 'undefined')) {
        return Module['disable_sdl_envents'] = false;
      }
    };
    okButton = {
      text: Epicport.i18n.html_ok,
      click: function() {
        var selected;
        selected = $('#select-file-dialog-file').val();
        if (selected) {
          success(selected + "." + extension);
          return $(this).dialog("close");
        } else {
          $('#select-file-dialog-file').focus();
        }
      }
    };
    cancelButton = {
      text: Epicport.i18n.html_cancel,
      click: function() {
        $(this).dialog("close");
        if (!(typeof Module === 'undefined')) {
          return Module['disable_sdl_envents'] = false;
        }
      }
    };
    if (hideFileInputField) {
      buttons = [cancelButton];
    } else {
      buttons = [okButton, cancelButton];
    }
    return $(".select-file-dialog").dialog({
      width: 650,
      modal: true,
      buttons: buttons,
      close: function() {
        if (!(typeof Module === 'undefined')) {
          return Module['disable_sdl_envents'] = false;
        }
      }
    });
  };

  API.prototype.autoSave = function() {
    try {
      if (!Epicport.API.selectFileDialogPtr) {
        Epicport.API.selectFileDialogPtr = Module['_malloc'](128);
      }
      Module['writeStringToMemory'](Epicport.i18n.html_autosave, Epicport.API.selectFileDialogPtr);
      Module['dunCall']('vi', 4, [Epicport.API.selectFileDialogPtr]);
    } catch(err) {}
  }

  API.prototype.pushSave = function(filePtr) {
    var contents, done, file, fs_object;
    done = Epicport.modalProgress();
    file = Module['Pointer_stringify'](filePtr);
    if (Module['FS_findObject']) {
      fs_object = Module['FS_findObject'](file);
    } else {
      fs_object = FS.findObject(file);
    }
    contents = fs_object.contents;
    var houseName = Epicport.API.houseName();
    var fileName = file.split("/").pop();
    var GameState = Parse.Object.extend("GameState");
    var query = new Parse.Query(GameState);
    query.equalTo("profile", Epicport.profile.identity);
    query.equalTo("name", fileName);
    query.first().then(function(gameState) {
      if (gameState && gameState.get("protected")) {
        return Epicport.modalMessage(Epicport.i18n.html_info, Epicport.i18n.html_game_protected);
      }
      var parseFile = new Parse.File(fileName, contents, "application/octet-stream");
      return parseFile.save().then(function() {
        gameState = gameState || new Parse.Object("GameState");
        gameState.set("profile", Epicport.profile.identity);
        gameState.set("name", fileName);
        gameState.set("house", houseName);
        gameState.set("data", parseFile);
        return gameState.save();
      }).then(function() {
        Epicport.API.files = Epicport.API.files.filter(function (_file) {
          return file !== _file;
        });
        Epicport.API.files.unshift(file);
        done();
        if (fileName !== Epicport.i18n.html_autosave) {
          return Epicport.modalMessage(Epicport.i18n.html_success, Epicport.i18n.html_game_saved);
        }
      });
    }).catch(function(error) {
      var status;
      done();
      status = 500;
      error = String(error) || "Unknown error";
      return Epicport.modalMessage("Error (" + status + ")", "(" + status + "): " + error);
    });
  };

  API.prototype.createFs = function() {
    var done;
    if (!Epicport.profile) {
      return;
    }
    if (Epicport.API.fsCreated) {
      return;
    }
    done = Epicport.modalProgress();
    var GameState = Parse.Object.extend("GameState");
    var query = new Parse.Query(GameState);
    query.equalTo("profile", Epicport.profile.identity);
    query.descending("updatedAt");
    query.find().then(function(results) {
      var files = results.map(function(object) {
        return "/home/caiiiycuk/play-dune/data/" + object.get("name");
      });
      return Epicport.API.loadFiles(files, function() {
        done();
        return Epicport.API.fsCreated = true;
      })
    }).catch(function(error) {
      var status;
      done();
      status = 500;
      error = String(error) || "Unknown error";
      return Epicport.modalMessage("Error (" + status + ")", "(" + status + "): " + error);
    });
  };

  API.prototype.loadFiles = function(files, callback) {
    var file, loaders, _i, _len;
    if (files.length) {
      $(".select-file-dialog ul > span").hide();
    }
    loaders = [];
    for (_i = 0, _len = files.length; _i < _len; _i++) {
      file = files[_i];
      Epicport.API.files.push(file);
      loaders.push(this.loadFile(file));
    }
    return async.parallel(loaders, function(error, files) {
      var name, parent, _j, _len1;
      if (error) {
        Epicport.modalMessage("Error", error);
      }
      if (files) {
        for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
          file = files[_j];
          if (!file) {
	      continue;
          }
          name = file.file.substring(file.file.lastIndexOf('/') + 1);
          parent = file.file.substring(0, file.file.lastIndexOf('/'));
          console.log("Creating file '" + name + "' in '" + parent + "'");
          Module['FS_createPath']("/", parent, true, true);
          Module['FS_createDataFile'](parent, name, file.data, true, true);
        }
      }
      return callback();
    });
  };

  API.prototype.loadFile = function(fileName) {
    return function(callback) {
      var GameState = Parse.Object.extend("GameState");
      var query = new Parse.Query(GameState);
      var houseName;
      var name = fileName.split("/").pop();
      query.equalTo("profile", Epicport.profile.identity);
      query.equalTo("name", name);
      query.first().then(function (object) {
        if (!object) {
          return callback(new Error("Not Found"), null);
        }
        houseName = object.get("houseName");
        return object.get("data").getData();
      }).then(function (data) {
        API.prototype.houseArgument(houseName);
        return callback(null, {
          file: fileName,
          data: atob(data)
        });
      }).catch(function (error) {
        var status;
        status = 500;
        error = String(error) || "Unknown error";
        Epicport.modalMessage("Error (" + status + ")", "(" + status + "): " + error);
        return callback(error, null);
      })
    };
  };

  API.prototype.playMusic = function(filePtr, loops) {
    var file, name;
    file = Module['Pointer_stringify'](filePtr);
    name = file.substring(file.lastIndexOf('/') + 1);
    Epicport.API.audio.src = "/" + name;
    return Epicport.API.audio.play();
  };

  API.prototype.volumeMusic = function(volume) {
    return Epicport.API.audio.volume = volume / 128.0;
  };

  API.prototype.haltMusic = function() {
    return Epicport.API.audio.pause();
  };

  API.prototype.houseName = function() {
    var houseName;
    var houseCode = Module['arguments'][0];
    switch (houseCode) {
      case "-a":
      default:
        houseName = "Atreides";
        break;
      case "-o":
        houseName = "Ordos";
        break;
      case "-h":
        houseName = "Harkonnen";
        break;
    }
    return houseName;
  };

  API.prototype.houseArgument = function(houseName) {
    var houseCode;
    switch (houseName) {
      case "Atreides":
      default:
        houseCode = "-a";
        break;
      case "Ordos":
        houseCode = "-o";
        break;
      case "Harkonnen":
        houseCode = "-h";
        break;
    }
    Module['arguments'] = [houseCode];
    return houseCode;
  };

  return API;

})();
