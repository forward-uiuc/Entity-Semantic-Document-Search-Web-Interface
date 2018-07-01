//This is node js wrapper to elasticsearch

'use strict';

//List the packages 
var express = require('express');
const { exec } = require('child_process');
var router = express.Router();
var bodyParser = require('body-parser');
var fs = require('fs');
//Create the express application
var app = express();

// const util = require('util');
// const exec = util.promisify(require('child_process').exec);


// Allow CORS so that backend and frontend could be put on different servers
var allowCrossDomain = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
};
app.use(allowCrossDomain);

var axios = require('axios');

//add an api endpoint to search
app.get('/search/:username',function(req,res){
	var query_string = req.params.username;
	console.log(req.params);
	// var pattern = username

	/** Qingling Kang's Change **/
	query_string = query_string.split('+').join(' ');
	query_string = query_string.split('$').join('#');
	query_string = query_string.toLowerCase()

	// var pattern = username
	console.log(query_string);
	// query_string = query_string.replaceAll('_entity_','');
	// let url = 'http://localhost:9200/entity_lucene_dinv_new_multiple/_search_with_clusters?pretty=true';
	// let url = 'http://localhost:9200/entity_lucene_doc/_search_with_clusters?pretty=true';
	let url = 'http://localhost:9200/entity_search_cs_departments/_search_with_clusters?pretty=true';
	console.log(url)
	let data ={
		'search_request':{
		    'query': query_string,
		    'size': 100
		}
	}  


	// let url = 'http://localhost:9200/entity_lucene/_search_with_clusters?pretty=true';
	// let data ={
	// 	'search_request':{
	// 	    'query':{
	// 	        "match":{
	// 	              "_all" : query_string
	// 	        }
	// 	    },
	// 	    'size': 100
	// 	},
	// 	'query_hint':"",
	// 	'field_mapping':{
	// 		"title":["_source.entityContent", "_source.name", "_source.physicalDoc", "_source.text"]
	// 	}
	// }  
  

	var header = {
		'Content-Type': 'application/json'
	}

	axios.post(url,data,header)
		.then((response)=>{
			// console.log(JSON.stringify(response.data.hits.hits))
			res.json(response.data)
		}) .catch(error=>{
			console.log(error)
	  	});
});

function similarButNotTheSameURLs (url1, url2) {
    let u1 = url1.split("#");
    let u2 = url2.split("#");
    let v1 = url1.split("?");
    let v2 = url2.split("?");
    return (u1 !== u2)
		&& ((u1[0] === u2[0]) || (u1.length === 1 || u2.length === 1))
        && ((v1[0] === v2[0]) || (v1.length === 1 || v2.length === 1));
}



//add an api endpoint to entity-semantic document search
app.get('/esdocumentsearch/:query',function(req,res){
	var query_string = req.params.query;
	// console.log(req.params);
	// var pattern = username

	/** Qingling Kang's Change **/
	query_string = query_string.split('+').join(' ');
	query_string = query_string.split('$').join('#');
	query_string = query_string.toLowerCase()

	// var pattern = username
	// console.log(query_string);
	// query_string = query_string.replaceAll('_entity_','');
	// let url = 'http://localhost:9200/entity_lucene_dinv_new_multiple/_search_with_clusters?pretty=true';
	// let url = 'http://localhost:9200/entity_lucene_doc/_search_with_clusters?pretty=true';
	// let url = 'http://localhost:9200/test_annotation/_es_document_search?pretty=true';
    let url = 'http://localhost:9200/cs_departments_top_ten/_es_document_search?pretty=true';
	// console.log(url)
	let data ={
		'search_request':{
		    'query': query_string,
		    'size': 100
		}
	}

	var header = {
		'Content-Type': 'application/json'
	}

	axios.post(url,data,header)
		.then((response)=>{
			// console.log(JSON.stringify(response.data.hits.hits))
            let hits = response.data.hits.hits;
            let newHits = [];

            for (var i = 0; i < hits.length; i++) {
                if (i === 0
					|| hits[i]["_score"] !== hits[i-1]["_score"]
					|| hits[i]["_source"]["title"] !== hits[i-1]["_source"]["title"]
					|| !similarButNotTheSameURLs(hits[i]["_source"]["url"],hits[i-1]["_source"]["url"])
				) {
                    newHits.push(hits[i]);
                    if (i>0 && i < 20) {
                    	console.log("====");
                        console.log(hits[i]["_source"]["title"]);
                        console.log(hits[i]["_score"] !== hits[i-1]["_score"]);
                        console.log(hits[i]["_source"]["title"] !== hits[i-1]["_source"]["title"]);
                        console.log(!similarButNotTheSameURLs(hits[i]["_source"]["url"],hits[i-1]["_source"]["url"]));
					}
                } else {
                    console.log("hello");
				}
            }

            response.data.hits.hits = newHits;

			res.json(response.data);

		}) .catch(error=>{
			console.log(error)
	  	});
});


//add an api to read the physical doc files 
app.get('/getPhysicalDoc/:fileName',function(req,res){
	var fileName = req.params.fileName;
	var path ="./Output/"+fileName
	var content;
	fs.readFile(path, "utf8", function read(err, data) {
		if (err) {
			console.log(err);
		}
		content = data;
		res.send(content)
		console.log(content);
	})
	
})

//add an api to read the physical doc files
app.get('/inferPageType',function(req,res){
	// console.log(req.query.info);
	var serFiles = req.query.info.split("_oOo_");
	//var tmp = ["#person mining"];
	var tmp = serFiles;
	//tmp.push(...serFiles);
	tmp[0] = tmp[0].split("+").join(" ").split("$").join("#");
	console.log(tmp);
    let aCommand = 'java -cp /entitysearch/entity_search/uber-EntityAnnotation-1.0-SNAPSHOT.jar org.forward.entitysearch.experiment.FindCommonPatternsInDocuments';
	//let aCommand = 'java -cp /Users/longpham/Workspace/EntityAnnotation/target/uber-EntityAnnotation-1.0-SNAPSHOT.jar org.forward.entitysearch.experiment.FindCommonPatternsInDocuments';
	for (var i = 0; i < tmp.length; i++) {
		aCommand += ' "' + tmp[i] + '"';
	}
	console.log(aCommand);
    exec(aCommand, (err, stdout, stderr) => {
        if (err) {
            // node couldn't execute the command
			console.log(err);
            return;
        }

        // the *entire* stdout and stderr (buffered)
        // console.log(`stderr: ${stderr}`);
        let output = `${stdout}`;
        // console.log(output);
        let queries = eval(output);
        console.log(queries);
        // var queries = ["@near ( #professor #email champaign )"];
        // var queries = ["@near ( #person #organization )","@near ( #number #person )","@near ( #date #person )","@near ( mining #date )","@near ( #person #location )","@near ( #location #person )","@near ( #misc #person )","@near ( #organization #person )","@near ( #person #misc )","@near ( #person #date )"]
        res.send(queries);
    });
    // async function ls() {
    //     const { output, stderr } = await exec(aCommand);
    //     console.log('stdout:', output);
    //     console.log('stderr:', stderr);
    // }
    // var tmp = ls();
    // var queries = eval(output);
    // var queries = ["@near ( #professor #email champaign )"];
	// var queries = ["@near ( #person #organization )","@near ( #number #person )","@near ( #date #person )","@near ( mining #date )","@near ( #person #location )","@near ( #location #person )","@near ( #misc #person )","@near ( #organization #person )","@near ( #person #misc )","@near ( #person #date )"]
    // res.send(queries);
});

//set port
app.set('port',(process.env.PORT ||1720));

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/staticFiles"));
app.use(express.static("public"));


// Spin up the server
app.listen(app.get('port'),function() {
	console.log('running on port', app.get('port'))
});



