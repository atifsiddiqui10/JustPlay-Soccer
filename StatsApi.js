import request from "request";
import { createHash } from "crypto"
import { sha512 } from "js-sha512";
import fetch from "node-fetch"
import fs from "fs"

import {MongoClient} from "mongodb";

class StatsAPI {
    outlet = "1mcmhe8u5fbli106kbuoh6umaj";
    secKey = 'f8ofuj6o7x1t1pa7mapq4y9j3'
    constructor(){
        this.oauthUrl = `https://oauth.performgroup.com/oauth/token`
    }


    requestPost(){
        const time = new Date().getTime();
        const token = `${this.outlet}${time}${this.secKey}`;
        const tokenhash = createHash("sha512").update(token).digest("hex")
        
        request.post(`${this.oauthUrl}/${this.outlet}?_fmt=json&_rt=b`, {
            body: `grant_type=client_credentials&scope=b2b-feeds-auth`,
            headers: {
                'Accept-Encoding': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${tokenhash}`,
                'Timestamp': time
            },
        }, (error, response, body)=> {
            console.log(response);
            // console.log(JSON.parse(body));
        })
    }

    async fetchPost() {
        const time = new Date().getTime();
        const token = `${this.outlet}${time}${this.secKey}`;
        const tokenhash = sha512.hex(token)
        const response = await fetch(`${this.oauthUrl}/${this.outlet}?_fmt=json&_rt=b`, {
            method: "POST",
            body: `grant_type=client_credentials&scope=b2b-feeds-auth`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${tokenhash}`,
                'Timestamp': time
            }
        })
        const data = await response.json();
        return(data.access_token);
    }

    //Tournament Calender API call 
    async tournamentCal(token) {
        const response = await fetch(`https://api.performfeeds.com/soccerdata/tournamentcalendar/${this.outlet}/authorized?_fmt=json&_rt=b`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        return response.json();
    }

    //Get teams by tournamnet ID 
    async teamsByTC(tcId, token){
        const response = await fetch(`https://api.performfeeds.com/soccerdata/team/${this.outlet}?_rt=b&_fmt=json&tmcl=${tcId}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        const mlsTeams22 = await response.json();
        //console.log(comp_teams);
        return mlsTeams22;
    }

    // Get squads for tournament  
    async squads(tcId, token){
        const response = await fetch(`https://api.performfeeds.com/soccerdata/squads/${this.outlet}?_rt=b&_fmt=json&tmcl=${tcId}&detailed=yes&_pgSz=100`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        const mlsSquads22 = await response.json();
        //console.log(comp_teams);
        return mlsSquads22;
    }

    async fixAndRes(tcId, token){
        const response = await fetch(`https://api.performfeeds.com/soccerdata/match/${this.outlet}?_rt=b&_fmt=json&tmcl=${tcId}&_pgSz=1000`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        const mlsFix22 = await response.json();
        //console.log(comp_teams);
        return mlsFix22;
    }

    async matchStats(matchID, token){
        const response = await fetch(`https://api.performfeeds.com/soccerdata/matchstats/${this.outlet}?_rt=b&_fmt=json&fx=${matchID}&_pgSz=1`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        const matchStat = await response.json();
        //console.log(comp_teams);
        return matchStat;
    }

    async matchEvent(matchID, token){
        const response = await fetch(`https://api.performfeeds.com/soccerdata/matchevent/${this.outlet}?_rt=b&_fmt=json&fx=${matchID}&_pgSz=500`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        const matchEvents = await response.json();
        //console.log(comp_teams);
        return matchEvents;
    }

    async PassMatAndFormation(matchID, token){
        const response = await fetch(`https://api.performfeeds.com/soccerdata/passmatrix/${this.outlet}?_rt=b&_fmt=json&fx=${matchID}&_pgSz=500`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        const passMatrix = await response.json();
        //console.log(comp_teams);
        return passMatrix;
    }

    async possession(matchID, token){
        const response = await fetch(`https://api.performfeeds.com/soccerdata/possession/${this.outlet}?_rt=b&_fmt=json&fx=${matchID}&_pgSz=500`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        const poss = await response.json();
        //console.log(comp_teams);
        return poss;
    }
    // need to be updated 
    async seasonalStats(tourID, token){
        const response = await fetch(`https://api.performfeeds.com/soccerdata/seasonalstats/${this.outlet}?_rt=b&_fmt=json&fx=${matchID}&_pgSz=500`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        const poss = await response.json();
        //console.log(comp_teams);
        return poss;
    }
}

/*
Get tourament calender
*/
const stats = new StatsAPI()
const accessToken = await stats.fetchPost();
const tournamentCal = await stats.tournamentCal(accessToken);
console.log("TOURNAMENT CALENDER")
//const tournamentCalender = JSON.tournamentCal
const tournamentCalender = JSON.stringify(tournamentCal, null, "\t")

// get mls teams for 2022 season using tournamnet calender ID 
const mls2022TourCalID = '8xix0odg0gckp6uu1eg05mnmc'
const MLS2022Teams = await stats.teamsByTC(mls2022TourCalID, accessToken);
//console.log(MLS2022Teams.contestant.length)
const mls22Teams = JSON.stringify(MLS2022Teams.contestant, null, "\t")

//get mls 2022 squads
const mls2022Squad = await stats.squads(mls2022TourCalID, accessToken);
const mls22Squad = JSON.stringify(mls2022Squad, null, "\t")
console.log(mls2022Squad.squad.length)

//get mls 2022 fixutes and results // look for post season 
const mls2022Fixutes = await stats.fixAndRes(mls2022TourCalID, accessToken);
const mls22Fixutes = JSON.stringify(mls2022Fixutes, null, "\t")

let matches = mls2022Fixutes.match
let mls2022MatchIds = []
matches.forEach(match => {
    mls2022MatchIds.push(match.matchInfo.id)
});
const mls22MatchIDs = JSON.stringify(mls2022MatchIds, null, "\n")
// fs.writeFile("./collections/mls22MatchIDS.json",mls22MatchIDs,function(err, result) {
//     if(err) console.log('error', err);
// });
console.log(mls2022MatchIds.length)



/*
    Connecting to mongo 
*/

async function mongoInsert(collecName, id, object){
    const url = "mongodb://localhost:30001";
    const dbName = 'soccer-stats-dev';

    const client = new MongoClient(url, { keepAlive : true, directConnection: true, connectTimeoutMS: 5000});
    client.connect();
    console.log("Success")
    const db = client.db("soccer-stats-dev");
    // const collection = db.collection(collecName);
    // collection.insertOne({"_id":id,"optaMatchId":id,"matchEvents": object});

    if(collecName == "mlsTeams"){
        const collection = db.collection(collecName);
        collection.insertOne({"_id":id,"optaTeamId":id,"Teams": object});
    }

    else if(collecName == "mls22Squads"){
        const collection = db.collection(collecName);
        collection.insertOne({"_id":id,"optaTeamId":id,"Squads": object});
    }

    else if(collecName == "mls22Fixtures"){
        const collection = db.collection(collecName);
        collection.insertOne({"_id":id,"optaFixtureId":id,"info": object});
    }

    else if(collecName == "mls22MatchStats"){
        const collection = db.collection(collecName);
        collection.insertOne({"_id":id,"optaMatchId":id,"matchStats": object});
    }

    else if(collecName == "mls22MatchEvents"){
        const collection = db.collection(collecName);
        collection.insertOne({"_id":id,"optaMatchId":id,"matchEvents": object});
    }

    else if(collecName == "mlsMatchPassMat"){
        const collection = db.collection(collecName);
        collection.insertOne({"_id":id,"optaMatchId":id,"matchPassMatrix": object});
    }

    else if(collecName == "mlsMatchPoss"){
        const collection = db.collection(collecName);
        collection.insertOne({"_id":id,"optaMatchId":id,"matchPoss": object});
    }

}

//MlS 2022 Teams
// MLS2022Teams.contestant.forEach((team, index, array) => {
//     const teamId = team.id
//     const data = team
//     mongoInsert("mlsTeams", teamId, data)
// });

//MLS team squads 
//console.log(mls2022Squad)
// mls2022Squad.squad.forEach((squad, index, obj)=>{
//     const teamId = squad.contestantId
//     const teamSquad = squad
//     console.log(teamId)
//     mongoInsert('mls22Squads', teamId, teamSquad)
// })

//mls 2022 fix
// console.log(mls2022Fixutes.match)
// mls2022Fixutes.match.forEach((fixture, index, array)=>{
//     const fixId = fixture.matchInfo.id
//     const fixInfo = fixture.matchInfo
//     mongoInsert('mls22Fixtures', fixId, fixInfo)
// })


// Match Stats 
// for (let x = 0; x < mls2022MatchIds.length; x ++){
//     let matchId = mls2022MatchIds[x];
//     const matchStats = await stats.matchStats(matchId, accessToken);
//     console.log(matchStats.matchInfo.id)
//     const mId = matchStats.matchInfo.id
//     const mStat = matchStats
//     // mongoInsert('mlsMatchStats', mId,mStat)

// }

// Match Events 
// for (let x = 0; x < mls2022MatchIds.length; x ++){
//     let matchId = mls2022MatchIds[x];
//     const matchEvents = await stats.matchEvent(matchId, accessToken)
//     console.log(matchEvents.matchInfo.id)
//     const mId = matchEvents.matchInfo.id
//     const mEvent = matchEvents
//     mongoInsert('mlsMatchEvents', mId,mEvent)

// }

// Match Pass Matrix and avg Positions 
for (let x = 0; x < mls2022MatchIds.length; x ++){
    let matchId = mls2022MatchIds[x];
    const passMatrix = await stats.PassMatAndFormation(matchId, accessToken)
    // console.log(passMatrix)
    const mId = passMatrix.matchInfo.id
    const mPass = passMatrix
    mongoInsert('mlsMatchPassMat', mId,mPass)

}

// // Match Possession 
// for (let x = 0; x < mls2022MatchIds.length; x ++){
//     let matchId = mls2022MatchIds[x];
//     const poss = await stats.possession(matchId, accessToken)
//     // console.log(passMatrix)
//     const mId = poss.matchInfo.id
//     const mPass = poss
//     mongoInsert('mlsMatchPassMat', mId,mPass)

// }



//transfers 

// Detailed Match Stats 

//season stats 

// Ranking

//Top performers 

// auto commentating 