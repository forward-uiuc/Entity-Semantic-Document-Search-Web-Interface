import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import _ from 'lodash'
import styles from './SearchArea.scss';
import TextField from 'material-ui/TextField';
import { Button, Icon, Input,Select,Form,Radio,Grid, Modal, Header,Action,Label,Segment, Container,Dropdown, Menu, Sticky, Sidebar, SidebarPushable, SidebarPusher} from 'semantic-ui-react'
// import SearchList from './SearchList.jsx' 
import ReactScrollableList from 'react-scrollable-list'
import axios from 'axios'
import IntegrationAutosuggest from './autosuggest.jsx'
import IntegrationAutosuggestDocument from './autosuggestdocument.jsx'

var crypto = require('crypto');



class SearchArea extends Component {
	constructor(props) {
		super(props);
		this.state ={
			searchEntity:'',
			searchConditionsForDoc:[],
			cluster:[],
			hits:[],

			isLoading: false,
			value: '',
			allresults: [],
			clusterExamples:[],
			output:[],
			documentName:[],

			open:false,
			addLabels: [],
			active: [],
			activeLabel: [true],
			showDocument:true,
			emptyResult:false,
			categories: [],
			labels:["all",],
			currentLabelarr: [],
			currentEntity:'',
			currentDocNum:'',
			currentText:'',
			PhysicalDoc:'',
			showModal:false,

			//search bar
			searchbyItem:'doc',
            examplePages:[],

			//documentation
			modalOpen: false,


		}
		this.handleResultSelect = this.handleResultSelect.bind(this);
		this.inputChangeHandler = this.inputChangeHandler.bind(this);
		this.inputChangeHandlerForDoc = this.inputChangeHandlerForDoc.bind(this);
		this.resetComponent = this.resetComponent.bind(this);
	
		
		this.baseUrl = 'http://crow.cs.illinois.edu:1720/';
		//this.baseUrl = 'http://localhost:1720/';
		this.searchClickHandler = this.searchClickHandler.bind(this);
		this.ClusterHandler = this.ClusterHandler.bind(this);

		this.showDocumentHandler = this.showDocumentHandler.bind(this);
		// Long: No need for physical document handler because we can just point to the real URL
		//this.phyDocHandler = this.phyDocHandler.bind(this);

		this.closeModal = this.closeModal.bind(this);
		this.getSearchValue = this.getSearchValue.bind(this);

		this.handleMenuItemClick = this.handleMenuItemClick.bind(this);

		this.handleExampleQuery = this.handleExampleQuery.bind(this);
		this.handleExampleQueryForDoc = this.handleExampleQueryForDoc.bind(this);
		this.handleUpdateValue = this.handleUpdateValue.bind(this);
		this.handleUpdateValueForDoc = this.handleUpdateValueForDoc.bind(this);

		this.handleOpen = this.handleOpen.bind(this);
		this.handleClose = this.handleClose.bind(this);


	}
 	
	componentWillMount() {
		document.addEventListener('click', this.handleOutsideClick, false);
		this.resetComponent()
		// console.log(this.props)
	}

	handleUpdateValue(value) {
		this.setState({ searchEntity: value });
	}

	handleUpdateValueForDoc(values) {
		console.log(values);
		this.setState({ searchConditionsForDoc: values });
	}

	handleMenuItemClick(e, { name }){
		this.setState({ searchbyItem: name })
	}

	getSearchValue(value){
		// console.log(value)
		this.setState({
			searchEntity:value
		})

	}

	//show more document results when click the clustercard 
	ClusterHandler(index,name,event){
		this.setState({
			currentEntity: name,
			output:[]
		})
		console.log(`index: ${index}`);
		console.log(`name: ${name}`);
		let currentEntityArr = this.state.cluster[index]
		currentEntityArr = currentEntityArr.document
		console.log("testing",currentEntityArr)
		let hits = this.state.hits;
		let output = [];
		let documentName = [];
		for(let i = 0; i  < currentEntityArr.length; i++){
			for(let j = 0; j < hits.length;j++){
				if(hits[j]._id == currentEntityArr[i].id){
					output.push(hits[j])
							// console.log(hits[j])
												//get the post.txt name
					let value = hits[j]._source.name;
					let fileName = value.substr(0,value.indexOf('.')-0);
					let fileUrl = this.baseUrl+ "getPhysicalDoc/" + value
					axios.get(fileUrl)
						.then((response)=>{
							// console.log(response.data)
							let content = response.data
							let curname = content.substr(0,content.indexOf('<')-0)
							documentName.push(curname)
							this.setState({ documentName: documentName })
						})
						.catch(error =>{
							console.log(error)
						})
				}
				

			}
		}

		//sort the score
		output.sort(function(a,b){
			if (a._score > b._score) {
				return -1;
			} else if (a._score < b._score) {
				return 1;
			}else{
				return 0
			}

		})
			
		// })
		console.log(output)
		this.setState({output: output});

	}

	showDocumentHandler(){
		let result = !this.state.showDocument;
		this.setState({
			showDocument: result
		})
	}

	resetComponent(){
		this.setState({ isLoading: false, output: [], value: '' })
	}

	handleResultSelect(event, { result }){
		// console.log(result)
		this.setState({ 
			value: result.title
		})
	}

	inputChangeHandler(event){
		// console.log(event.target.value)
		this.setState({
			output:[],
			searchEntity:event.target.value,
			activeLabel: [true],
		})

		event.preventDefault();
	}

	inputChangeHandlerForDoc(event){
		// console.log(event.target.value)
		this.setState({
			output:[],
			searchConditionsForDoc:event.target.value,
			activeLabel: [true],


		})

		event.preventDefault();
	}

	handleExampleQuery(value,event){
		console.log(value)
		// this.getSearchValue(value)
		this.handleUpdateValue(value);
	}

	handleExampleQueryForDoc(type_subs, kw_sub, event){
		this.handleUpdateValue(kw_sub);
		this.handleUpdateValueForDoc(type_subs);
	}

	handleClickingMoreLikeThis(imgSrc, serFile, url, event) {
		// var selected = []
		// var recs = document.getElementsByClassName("es-more-like-this");
		// for (var i = 0; i < recs.length; i++) {
         //    let checkedBox = recs[i].getElementsByTagName("input")[0];
         //    if (checkedBox.checked) {
		// 		selected.push(checkedBox.name);
		// 	}
		// }
		console.log(imgSrc);
		console.log(serFile);
		console.log(url);
		console.log(event.target.checked);
		let tmp = [];
		if (event.target.checked) {
            tmp = [...this.state.examplePages];
            tmp.push({"img":imgSrc,"ser":serFile,"url":url});
        } else {
            tmp = [];
            for (var i = 0; i < this.state.examplePages.length; i++) {
                if (this.state.examplePages[i].url != url) {
                    tmp.push(this.state.examplePages[i]);
                }
            }
        }
        this.setState({
            examplePages: tmp,
        });

	}

    inferDocumentProperties(event) {
        let tmp = this.state.searchEntity.trim().split(" ").join("+").split("#").join("$") + "_oOo_";
        for (var i = 0; i < this.state.examplePages.length-1; i++) {
            tmp += this.state.examplePages[i]["ser"] + "_oOo_";
        }
        tmp+=this.state.examplePages[this.state.examplePages.length-1]["ser"];
        let fileUrl = this.baseUrl+ "inferPageType" + "?info=" + tmp;
        console.log(fileUrl);
        axios.get(fileUrl
        ).then((response)=>{
                let queries = response.data;
                console.log(queries);
                this.setState({
                    searchConditionsForDoc: this.state.searchConditionsForDoc.concat(queries),
                })
            })
            .catch(error =>{
                console.log(error)
            })
    }

	searchClickHandler(event){

		
		let entity = this.state.searchEntity;

		let current_url = this.baseUrl + "search/" + entity;
		if (this.state.searchbyItem !== 'entity') {
			entity = "@contains ( " + this.state.searchEntity.trim() + " ) " + this.state.searchConditionsForDoc.join(" ");
			current_url = this.baseUrl + "esdocumentsearch/" + entity;
		}

		//Qingling Kang's code
		current_url = current_url.split(" ").join("+");
		current_url = current_url.split("#").join("$");

		//Long's code
		console.log(current_url);
		//current_url = current_url.split('').join('');
		//console.log(current_url);

		axios.get(current_url)
			.then((response)=>{
				// console.log(response.data);
				let cluster = response.data.clusters;
				let hits = response.data.hits.hits;
				let output = [];
				if (cluster.length > 0) {
					for(let i = 0; i  < cluster.length; i++){
						for(let j = 0; j < hits.length;j++){
							if(hits[j]._id == cluster[i].document[0].id){
								output.push(hits[j])

								//get the post.txt name
								//let value = hits[j]._source.name;
								//let fileName = value.substr(0,value.indexOf('.')-0);
								//let fileUrl = this.baseUrl+ "getPhysicalDoc/" + value
								//axios.get(fileUrl)
								//	.then((response)=>{
								//		// console.log(response.data)
								//		let content = response.data
								//		let curname = content.substr(0,content.indexOf('<')-0)
								//		documentName.push(curname)
								//		this.setState({ documentName: documentName })
								//	})
								//	.catch(error =>{
								//		console.log(error)
								//	})
							}
						}
					}
				} else {
					for(let j = 0; j < hits.length;j++){					
						output.push(hits[j])
					}
				}

				this.setState({
					//currentEntity:'',
					//cluster: response.data.clusters,
					hits: response.data.hits.hits,
					output: output,
					//clusterExamples:output,

				});

				if(response.data.hits.total === 0){
					// console.log("Get empty result")
					this.setState({
						emptyResult:true
					})
				}

				// console.log(response.data.clusters);
				// console.log("hits", this.hits);
				// console.log(response.data.hits.hits);
			})
			.catch(error=>{
				console.log(error);
	  		});
	}

    phyDocHandler(value,text,event){

		console.log("value",value)
		let fileName = value.substr(0,value.indexOf('.')-0);
		// console.log(fileName)
		console.log("text",text)

		this.setState({
			currentDocNum:fileName,
			currentText:text
		})
		let fileUrl = this.baseUrl+ "getPhysicalDoc/" + value
		axios.get(fileUrl)
			.then((response)=>{
				console.log(response.data)
				let content = response.data
				
				this.setState({
					physicalDoc:response.data,
					showModal:true
				})
			})
			.catch(error =>{
				console.log(error)
			})
	}
	closeModal(){
		this.setState({
			physicalDoc: '',
			currentDocNum:'',
			showModal:false
		})

	}

	handleOpen(){
		this.setState({ modalOpen: true })
	}

 	handleClose(){
 		this.setState({ modalOpen: false })
 	}

   	render(){
   		const { 
   			isLoading,
   			value, 
   			output,
   			addLabels,
   			labels,
   			cluster,
   			hits,
   			currentEntity,
   			showDocument,
   			showModal,
   			currentDocNum,
   			physicalDoc,
   			currentText,
			clusterExamples,
   			searchbyItem,
   			emptyResult,
   			documentName
   		} = this.state
   		// console.log("tsting",documentName[0])
   		// console.log("testing",output);
   		// console.log(this.state.results.length)
   		// console.log(this.state.searchEntity)
   		// if(output.length == 0){
   		// 	output[0] = "No result found yet!"
   		// };

   		let phyDoc=(
			<Modal id="modal"  open={this.state.showModal}>
			
			<Header content={currentDocNum} />

			    <Modal.Content scrolling>
					<div>
						{physicalDoc}
					</div>
					 </Modal.Content>
			    <Modal.Actions>
			     <Button color='green' onClick = {this.closeModal}>
			        <Icon name='remove'/> Close
			      </Button>
			    </Modal.Actions>

		 </Modal>

   		);

   		let EntityResult =(
   			<div className="resultcard1">
				
				 	<div className="header resultheader">
				 		<Header as='h2'>Found {cluster.length} entities</Header>
				 	</div>
				 	<div className="content entityContent">
				 	{cluster.map((item,i)=> 
					 	<div key={i} className="ui card clustercard entityhover">
							<div className="content">
					 			<div className="entityHeader">{item.name}</div>	
							</div>
							<div className="content">
							    {
							    /*
							    <div className="description resultText">
	 								<span>{clusterExamples[i]._source.text.substr(0,clusterExamples[i]._source.charOffset)}</span>
	 							 	<span className="highlight">{clusterExamples[i]._source.text.substr(clusterExamples[i]._source.charOffset,clusterExamples[i]._source.name.length)}</span>
	 							 	<span>{clusterExamples[i]._source.text.substr(parseInt(clusterExamples[i]._source.charOffset)+parseInt(clusterExamples[i]._source.name.length))}</span>
	 							 	<span> <a onClick={this.phyDocHandler.bind(this,clusterExamples[i]._source.name,clusterExamples[i]._source.text)}>read more...</a> </span>
	 							</div>
							    */
							    }
								<div className="description resultText">

									<div> <a href={clusterExamples[i]._source.url}>
							    	{clusterExamples[i]._source.url} </a> </div>
							    	<div> {clusterExamples[i]._source.title} </div>
	 								/*<span>{clusterExamples[i]._source.text.substr(0,200)}</span>*/
	 							</div>
								<div className="meta">score:&nbsp;{item.score} (from {item.document.length} relevant web pages) </div> 					 			
 							</div>
	 						
						</div>
					)}
				</div>
			</div>
		);

   		let DocumentResult=(
			
   					<div className="docblock">
				 	{output.map((item,i)=>
                        <div key={i} className="ui card padded clustercard raised">
                            <div className="content">
                                <div className="ui top left attached label clip-text"><a href={item._source.url}>{item._source.url}</a></div>
                                <div><img src={this.baseUrl + "screenshots/" + crypto.createHash('md5').update(item._source.url).digest('hex') + ".png"} style={{width:'100%'}} alt="Image not found"/></div>
                                <div className="meta es-more-like-this">
                                    <input type="checkbox" onClick={this.handleClickingMoreLikeThis.bind(this, this.baseUrl + "screenshots/" + crypto.createHash('md5').update(item._source.url).digest('hex') + ".png", item._source.text.split("_DO_LOAD_SERIALIZED_FILE_")[1],item._source.url)}/>
                                    <span className="es-more-like-this-btn"> More This Type Of Page </span>
                                </div>
                                <div className="header docheader">
                                    {item._source.title}
                                </div>
                                {/*<div className="description resultText">*/}
                                    {/*<span>{item._source.text.substr(0,item._source.charOffset)}</span>*/}
                                    {/*<span className="highlight">{item._source.text.substr(item._source.charOffset,item._source.name.length)}</span>*/}
                                    {/*<span>{item._source.text.substr(parseInt(item._source.charOffset)+parseInt(item._source.name.length))}</span>*/}
                                    {/*<span><a onClick={this.phyDocHandler.bind(this,item._source.name,item._source.text)}> read more..</a></span>*/}
                                {/*</div>*/}
                                <div className="meta">score:&nbsp;{item._score}</div>
                            </div>
                        </div>
					)}
				 	</div>
   		);

        let documentation = (
            <Container className="searchbar">
                <Modal
                    trigger={<a onClick={this.handleOpen}>Documentation</a>}
                    open={this.state.modalOpen}
                    onClose={this.handleClose}
                    basic
                    size='small'
                >
                    <Modal.Content>
                        <img style={{width:'100%'}} src="./assets/documentation.png"/>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='green' onClick={this.handleClose} inverted>
                            <Icon name='checkmark' /> Got it
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Container>
        );

        let sampleQueries = (
            <div className="ui compact menu">
                <div className="ui simple dropdown item">
                    Sample Queries
                    <i className="dropdown icon"></i>
                    <div className="menu">
                        <div className="item">
                            <Header as='h4'
                                    onClick={this.handleExampleQueryForDoc.bind(this,["@near ( #person #email )", "@near ( #person #phone )"], "#person data mining")}>
                                Search for professor home pages with interest in data mining
                            </Header>
                        </div>
                        <div className="item">
                            <Header as='h4'
                                    onClick={this.handleExampleQueryForDoc.bind(this,["@near ( #professor #phone #topic )"], "#person biology")}>
                                Search for CS professor home pages with work related to biology domain
                            </Header>
                        </div>
                        <div className="item">
                            <Header as='h4'
                                    onClick={this.handleExampleQueryForDoc.bind(this,["@contains ( hours #professor )"], "mining")}>
                                Search for CS courses related to data mining
                            </Header>
                        </div>
                        <div className="item">
                            <Header as='h4'
                                    onClick={this.handleExampleQueryForDoc.bind(this,["@near ( #person #email )", "@near ( #number hours )"], "machine learning")}>
                                Search for CS courses related to Machine Learning
                            </Header>
                        </div>
                        <div className="item">
                            <Modal
                                trigger={<a onClick={this.handleOpen}>Documentation</a>}
                                open={this.state.modalOpen}
                                onClose={this.handleClose}
                                basic
                                size='small'
                            >
                                <Modal.Content>
                                    <img style={{width:'100%'}} src="./assets/documentation.png"/>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button color='green' onClick={this.handleClose} inverted>
                                        <Icon name='checkmark' /> Got it
                                    </Button>
                                </Modal.Actions>
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
        );

   		let searchBar = (
   			<Container className="searchbar">

					
		     		{(searchbyItem === 'entity')?
		     		(
                        <Grid columns='equal'>
                            <Grid.Column width={9}>
                                <div> Specify entities and describe their contexts by keywords: </div>
                                <IntegrationAutosuggest getSearchValue={this.getSearchValue} onEnter={this.searchClickHandler} onUpdateValue={this.handleUpdateValue} searchValue={this.state.searchEntity} />
                            </Grid.Column>
                                <Grid.Column width={7}>
                                    <button className="ui icon button" role="button" onClick={this.searchClickHandler}>
                                <i aria-hidden="true" className="search icon"></i>
                                Search
                                </button>

                            {/*<Dropdown floating labeled button className='icon' text='Choose Search Type'>
                                    <Dropdown.Menu>
                                        <Dropdown.Item name='entity' active={searchbyItem === 'entity'} onClick={this.handleMenuItemClick} >
                                            Entity Search
                                        </Dropdown.Item>
                                        <Dropdown.Item name='doc' active={searchbyItem  === 'doc'} onClick={this.handleMenuItemClick} >
                                            Entity-semantic Document Search
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>*/}
                            {/*showDocument ?
                                    (<Button className="clusterbutton" onClick={this.showDocumentHandler} disabled={searchbyItem === 'doc'}>
                                        Hide Document
                                    </Button>)
                                    :
                                    (<Button className="clusterbutton" onClick={this.showDocumentHandler} disabled={searchbyItem === 'doc'}>
                                        Show Document
                                    </Button>)*/
                            }
                                </Grid.Column>
                        </Grid>
		     		):
		     		(
		     		<table>
                        <tbody>
                            <tr>
                                <td>
                                    <IntegrationAutosuggest getSearchValue={this.getSearchValue} onEnter={this.searchClickHandler} onUpdateValue={this.handleUpdateValue} searchValue={this.state.searchEntity} />
                                </td>
                                <td>
                                    {sampleQueries}
                                </td>
                                <td>
                                    <button className="ui icon button" role="button" onClick={this.searchClickHandler}>
                                        <i aria-hidden="true" className="search icon"></i>
                                        Search
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                        {/*<div> Describe the target page by keywords and entities: </div>*/}

						{/*{(this.state.searchConditionsForDoc.length > 0)?*/}
							{/*(<div> Describe the type of target page: </div>):*/}
							{/*(<div></div>)*/}
						{/*}*/}
                        {/*<IntegrationAutosuggestDocument onEnter={this.searchClickHandler} onUpdateValue={this.handleUpdateValueForDoc} searchValues={this.state.searchConditionsForDoc} />*/}
		     		</table>
		     		)}
		     		



			</Container>
   		);

   		let suggestInput = (searchbyItem === 'entity')?(

   			<Container className="searchbar">
   					<Header size='small'>Example Queries for Entity Search</Header>
   				  	<Grid columns='equal'>
					    <Grid.Row className="example">
					      	<Grid.Column>
					       		<Header as='h4' 
					       				color='red'
					       				onClick={this.handleExampleQuery.bind(this,"#professor mining")}>
					       				#professor mining
					       		</Header> 
					     	</Grid.Column>
					      	<Grid.Column>
								<Header as='h4' color='orange' 
										onClick={this.handleExampleQuery.bind(this,"#professor #topic mining")}>
										#professor #topic mining
								</Header>  						       		
					      	</Grid.Column>
					      	<Grid.Column>
					       		<Header as='h4' 
					       				color='olive'
					       				onClick={this.handleExampleQuery.bind(this,"reset through #topic machine learning")}
					       				>
					       				#topic machine learning
					       		</Header>
					      	</Grid.Column>
					    </Grid.Row>

					    <Grid.Row>
						      <Grid.Column width={5}>
						      	 	<Header as='h4' 
						      	 	 		color='teal'
						      	 	 		onClick={this.handleExampleQuery.bind(this,"#professor #sponsor_agency")}>
						      	 	 		#professor #sponsor_agency
						      	 	</Header>
						      </Grid.Column>
						      <Grid.Column width={6}>
						       		<Header as='h4' 
						       				color='blue'
						       				onClick={this.handleExampleQuery.bind(this,"#conference #professor")}
						       				>
						       				#conference #professor
						       		</Header>
						      </Grid.Column>						      		
						</Grid.Row>
					</Grid>
   			</Container>
   		)
   		:
   		(
   		<span></span>
   		);

		return(
			<div className = "SearchArea">
				{searchBar}
                {
                    searchbyItem === 'entity' ?
                        <span>{documentation}</span>:
                        <span></span>
                }
				{suggestInput}
				{
					hits.length != 0 ? 
					    ( 
					    	searchbyItem === 'entity' ?
								<Container className ="searchResult">
									<Grid columns={showDocument? 2 :1 }>						
							 			<Grid.Column width={showDocument? 10 :16}>
							 				{EntityResult}
							 			</Grid.Column>
							 			{
								 			showDocument?
									 			(
										 			<Grid.Column width={6} className="correspondingDoc">
										 				<div className="ui card resultcard">
															<div className="content ">
				 												<div className="header resultheader">
				 													<Header as='h3'>Relevant Web Pages</Header>
				 												</div>

										 							{DocumentResult}
										 					</div>
										 				</div>
										 			</Grid.Column>
									 			)
								 			:null
							 			}
							 		</Grid>
								</Container>
								:
                                <Container className ="searchResult">
                                    <Grid columns={2} >
                                        <Grid.Column width={4}>
                                            <div className="ui card resultcard">
                                                <div id="es-side-header" className="ui top attached label" >Properties of Page Results</div>
                                                <div id="es-side-filters">
                                                    <IntegrationAutosuggestDocument onEnter={this.searchClickHandler} onUpdateValue={this.handleUpdateValueForDoc} searchValues={this.state.searchConditionsForDoc} />
                                                </div>
                                            </div>
                                        </Grid.Column>
                                        <Grid.Column width={12}>

                                            <div>Found {output.length} relevant documents</div>

                                            <div className="ui resultcard">
                                                <div className="content ">
                                                     {DocumentResult}
                                                </div>
                                            </div>
                                        </Grid.Column>
                                    </Grid>
                                </Container>
						)
					: 
					(
						emptyResult?
						(
							<Container className ="searchResult">
								<Grid columns={1}>						
						 			<Grid.Column width={16}>
						 				<div className="ui card resultcard1">
						 					<div className="content">
						 					 	<Header as='h3'>No results containing all your search terms were found.</Header>
						 					 </div>
						 				</div>
						 			</Grid.Column>
							 	</Grid>
							</Container>
						) :null 
					)

				}
				{/*footer*/}
                {
                    (this.state.examplePages.length > 0)?
                    (<div id="es-more-like-this-footer">
                        {this.state.examplePages.map((item,i)=>
                            <div key={i} className="table-cell">
                                <img src={item["img"]}>
                                </img>
                            </div>
                        )}
                        <div className="table-cell">
                            <Button id="inferDocumentPropertiesBtn" color='grey' onClick = {this.inferDocumentProperties.bind(this)}>
                                Infer From These Examples
                            </Button>
                        </div>
                    </div>): (<div></div>)
                }

			</div>
		)
	
  	}
}
export default SearchArea;



