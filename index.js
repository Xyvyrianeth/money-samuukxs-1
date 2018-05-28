const Discord = require("discord.js");
const client = new Discord.Client();

client.login(process.env.TOKEN);

client.on("ready", () => {
  console.log("Ready!");
});

var attacks = {};
var defends = {};
var clear   = {};
var teams   = {
    us: [],
    ally: [],
    enemy: []
};
var started = false;

client.on('message', message => {
    if (message.author.bot) return;
    
    let args = message.content.toLowerCase().split(/ {1,}/g);

    switch (args[0]) {
        case "s!start":
            if (message.author.id != "268129384076935178") return;
            started = true;
            clear.channel = message.channel;
            clear.timer = setInterval(function() {
                if (clear.time < 1) {
                    clear.channel.send("@everyone Please Check all Battle Stations type s!clear when all have been checked.");
                    clear.time = 100 * 60 * 5;
                }
                
                else clear.time--;
            }, 10);
            clear.time = 100 * 60 * 60;
            message.channel.send("Bot has been started. Type `s!stop` to stop it.");
            break;

        case "s!stop":
            if (message.author.id != "268129384076935178") return;
            started = false;
            clearInterval(clear.timer);
            clear = {};
            for (let i = attacks.length; i--;) {
                clearTimeout(attacks[i]);
            }
            for (let i = defends.length; i--;) {
                clearTimeout(defends[i]);
            }
            attacks = {};
            defends = {};
            message.channel.send("Bot has been stopped. Type `s!start` to restart it.");
            break;

        
        case "s!clear":
            if (!started) return;
            clear.time = 100 * 60 * 60;
            message.channel.send("All battle stations have been secured. Recheckings will commense in one (1) hour.");
            break;

        case "s!check": 
            if (!started) return;
            if (!args[1]) return message.channel.send("Please specify which battle  you'd like to check.");
            if (/^[0-9]{1,}-[0-9]{1,}$/.test(args[1])) {
                if (attacks[args[1]]) return message.channel.send("We are currently attacking this map.");
                else if (defends[args[1]]) return message.channel.send("This map is currently under attack.");
                else if (teams["us"].includes(args[1])) return message.channel.send("This battle station is currently owned by us please check it every hour at least");
                else if (teams["ally"].includes(args[1])) return message.channel.send("This battle station is currently owned by an allianced clan");
                else if (teams["enemy"].includes(args[1])) return message.channel.send("This battle station is currently owned by an enemy clan");
                else return message.channel.send("This map is currently not added into the database or is not owned by anyone");
            }
            break;


        case "s!attack":
            if (!started) return;
            if (!args[1]) return message.channel.send("Please specify which battle station you'd like to attack.");
            if (/^[0-9]{1,}-[0-9]{1,}$/.test(args[1])) {
                if (attacks[args[1]]) return message.channel.send("This map is all ready under attack!");
                attacks[args[1]] = setInterval(function() {
                        message.channel.send(`@everyone We are attacking a Battle Station in ${args[1]} please come and help! Please type s!end when the attack is over`);
                    }, 1000 * 60 * 5)
                return message.channel.send(`@everyone We are attacking a Battle Station in ${args[1]} please come and help! Please type s!end when the attack is over`);
            }
            break;

    
        case "s!end":
            if (!started) return;
            if (!args[1]) return message.channel.send("Please specify which battle station you'd like to stop attacking.");
            if (/^[0-9]{1,}-[0-9]{1,}$/.test(args[1])) {
                if (!attacks[args[1]]) return message.channel.send("This battle station is not under attack!");
                clearInterval(attacks[args[1]]);
                delete attacks[args[1]];
                return message.channel.send("Battle station " + args[1] + " is no longer under attack!");
            }
            break;

    
        case "s!defend":
            if (!started) return;
            if (!args[1]) return message.channel.send("Please specify which battle station you'd like to defend.");
            if (/^[0-9]{1,}-[0-9]{1,}$/.test(args[1])) {
                if (defends[args[1]]) return message.channel.send("This map is allready being defended!");
                defends[args[1]] = setInterval(function() {
                    message.channel.send(`@everyone Battle station in ${args[1]} is under attack please type s!secure when battle station is safe.`);
                }, 1000 * 60 * 5);
                return message.channel.send(`@everyone Battle station in ${args[1]} is under attack please type s!secure when battle station is safe.`);
            }
            break;

    
        case "s!secure":
            if (!started) return;
            if (!args[1]) return message.channel.send("Please specify which battle station you'd like to secure.");
            if (/^[0-9]{1,}-[0-9]{1,}$/.test(args[1])) {
                if (!defends[args[1]]) return message.channel.send("This battle station is already secured!");
                clearInterval(defends[args[1]]);
                delete defends[args[1]];
                return message.channel.send("Battle station " + args[1] + " is now secure!");
            }
            break;

        case "s!list":
            if (!started) return;
            message.channel.send("__`List of commands:`__\n`s!attack [map] - Declares a map to be attacked`\n`s!end [map]    - Declares a map is done being attacked`\n`s!defend [map] - Declares a map to be defended`\n`s!secure [map] - Declares a map is done being defended`\n`s!check [map]  - Shows the status of a map`\n`s!clear        - All maps are secure`");
            break;

        case "s!add": 
            if (!started) return;
            if (!args[1]) return message.channel.send("Add what to who? s!add [map] [us/ally/enemy]");
            if (!/^[0-9]{1,}-[0-9]{1,}$/.test(args[1])) return message.channel.send("That's not a map, doofus.");
            if (!args[2]) return message.channel.send("Add this map to which team?");
            if (!["us", "ally", "enemy"].includes(args[2])) return message.channel.send("Cannot add this map to them, must be us, ally, or enemy.");
            else {
                for (let i = 3; i--;) {
                    let a = ["us", "ally", "enemy"];
                    if (teams[a[i]].includes(args[1])) {
                        teams[a[i]] = teams[a[i]].remove(args[1]);
                        teams[args[2]].push(args[1]);
                        return message.channel.send(`Battle station ${args[1]} set to ${args[2]}.`);
                    }
                }
                teams[args[2]].push(args[1]);
                return message.channel.send(`Battle station ${args[1]} set to ${args[2]}.`);
            }
            break;
    }
    
});

Object.defineProperty(Array.prototype, 'remove', {
    value: function(a, b) {
        if (typeof this != "object" && !this.length) return this;
        if (typeof a != "string" && typeof a != "number") return this;
        if (!this.includes(a)) return this;
        if (!b) {
			this.splice(this.indexOf(a), 1);
			return this;
        }
        else return this.filter(item => item !== a);
    }
});