var http = require("http");
var url = require("url");
var nowjs = require("now");

function start(router) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        console.log("Request for " + pathname + " received.");
        router.dispatch(request, response, function(err) {
            if(err) {
                console.log("ERROR: " + err);
                response.writeHead(404);
                response.end();
            }
        });
    }

    var httpServer = http.createServer(onRequest);
    httpServer.listen(18888);
    console.log("Server has started - http://localhost:18888");

    var everyone = nowjs.initialize(httpServer);

    nowjs.Group.prototype.removeAllUsers = function () {
        var users = Object.keys(this.users);
        console.log("Users of " + this.groupName + " -> " + users);
        for(var i = 0; i < users.length; i++) {  
            var id = users[i];
            console.log("Removing " + id + " from " + this.groupName);
            this.removeUser(id);
        }
        return users;
    };

    nowjs.Group.prototype.addAllUsers = function (users) {
        for(var i = 0; i < users.length; i++) {  
            var id = users[i];
            console.log("Adding " + id + " to " + this.groupName);
            this.addUser(id);
        }
    };

    nowjs.User.prototype.sendToGroup = function(function_name, args) {
        var self = this;
        self.getGroups(function(groups) {
            for(var i = 0; i < groups.length; i++) {
                if(groups[i] !== "everyone") {
                    var group = nowjs.getGroup(groups[i]);
                    group.now[function_name].apply(group, [self.user.clientId].concat(args) );
                }
            }
        });
    };

    nowjs.User.prototype.getGroup = function () {
        var groups = Object.keys(this.groups);
        for(var i = 0; i < groups.length; i++) {
            if(groups[i] !== "everyone") {
                return this.groups[groups[i]];
            }
        }
        console.log("User is not in a special group");
        return this.groups("everyone");
    };

    nowjs.getGroups = function() {
        console.log("Getting all groups");
        return Object.keys(this.groups);
    }

    var lines = {};
    everyone.now.init = function(group_name) {
        if(typeof group_name === "undefined") {
            group_name = "default";
        }
        if(!lines.hasOwnProperty(group_name)) {
            lines[group_name] = [];
        }
        var group = nowjs.getGroup(group_name);
        group.addUser(this.user.clientId);

        this.now.setLines(lines[group_name]);
    }

    everyone.now.drawLine_server = function(line) {
        lines[this.getGroup().groupName].push(line);
        this.sendToGroup("drawLine_client", [line]);
    }

    everyone.now.undo_server = function(savepoint) { 
        var self = this;
        var group_name = this.getGroup().groupName;
        lines[group_name] = lines[group_name].filter(function(element, index, array) {
            return !(element[6] == self.user.clientId && index >= savepoint);
        });
        this.sendToGroup("undo", [savepoint]); 
        console.log("undoing to " + savepoint + ", " + this.user.clientId +"'s lines");
    }
    everyone.now.clear_server = function() {
        lines[this.getGroup().groupName] = []
            this.sendToGroup("clear_client", []);
    }
    everyone.now.bcast_cursor = function(cursor) {
        this.sendToGroup("draw_cursor", [cursor]);
    }
    everyone.now.change_session = function(session_name) {
        var all_groups = nowjs.getGroups();
        console.log("All groups -> " + all_groups);

        if(all_groups.indexOf(session_name) != -1) {
            console.log("Group " + session_name + " already exists!");
            this.now.switch_session(this.user.clientId, this.user.getGroup().groupName);
            return;
        }
        var current_group = this.getGroup();    
        var new_group = nowjs.getGroup(session_name);

        lines[new_group.groupName] = lines[current_group.groupName];
        lines[current_group.groupName] = [];

        var users = current_group.removeAllUsers();
        new_group.addAllUsers(users);
        this.sendToGroup("switch_session", [session_name]);
    }
}

exports.start = start;
