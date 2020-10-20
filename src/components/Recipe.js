import {connect} from "react-redux";
import {selectAlgorithm} from "../ducks/algorithms";
import React from "react";
import {getAlgorithmDefinitions, getGroup} from "./algorithmsLibrary";
import {v4 as generateTaskId} from "uuid";
import {ADDED, COMPLETED, FAILED, RUNNING} from "../ducks/tasks";
import {getActiveDatabase} from "../services/stores/neoStore";
import {Button, Card, CardGroup, Container, Icon, Menu} from "semantic-ui-react";
import {SuccessTopBar} from "./Results/SuccessTopBar";
import {TableView} from "./Results/TableView";
import CodeView from "./CodeView";
import {ChartView} from "./Results/ChartView";
import {communityNodeLimit, limit} from "../ducks/settings";
import {AlgoFormView} from "./AlgorithmForm";
import {VisView} from "./Results/VisView";

import {Route, Switch, useHistory, useParams, useRouteMatch} from "react-router-dom";
import {onRunAlgo} from "../services/tasks";

const containerStyle = {
    padding: '1em'
}



const recipes = {
    "directed-graph-influencers": {
        name: "Directed Graph Influencers",
        shortDescription: "This recipe contains algorithms that find the most influential nodes in a directed graph.",
        slides: [
            {
                group: "Centralities",
                algorithm: "Degree",
                title: "Degree Centrality",
                description: <React.Fragment>
                    <p>
                        Degree Centrality finds the most influential or central nodes in a graph based on the
                        number of relationships that the node has.
                    </p>
                    <p>
                        By default, it counts the number of incoming relationships but this value can be
                        configured via the <i>Relationship Orientation</i> parameter.
                    </p>
                    <p>
                        The weighted degree centrality for each node is computed by providing an optional
                        relationship property name via the <i>Weight Property</i> parameter.
                    </p>
                </React.Fragment>
            },
            {
                group: "Centralities",
                algorithm: "Page Rank",
                title: "Page Rank",
                description: <React.Fragment>
                    <p>
                        Page Rank finds the nodes that have the great transitive influence.
                    </p>
                    <p>
                        This means that it's not only how many incoming relationships that matters, it's also the importance of the nodes on the other side of that relationship.
                    </p>
                </React.Fragment>
            }
        ]
    }
}


const RecipeView = (props) => {
    let { path, url } = useRouteMatch();

    return <Switch>
        <Route exact path={path}>
            <React.Fragment>
                <div className="page-heading">
                    Algorithm Recipes
                </div>

            <div style={containerStyle}>
                <p>
                    Algorithm Recipes are collections or series of algorithms that provide provide useful insights on
                    certain types of graphs or can be combined to solve data science problems.
                </p>
                <Recipes recipes={recipes}/>


            </div>
            </React.Fragment>
        </Route>
        <Route path={`${path}/:recipeId`}>
            <IndividualRecipe
                metadata={props.metadata}
                limit={props.limit}
                gdsVersion={props.metadata.versions.gdsVersion}
            />
        </Route>
    </Switch>
}

const IndividualRecipe = (props) => {
    const panelRef = React.createRef()
    const [activeItem, setActiveItem] = React.useState("Configure")
    const [activeResultsItem, setActiveResultsItem] = React.useState("Table")

    const getStyle = name => name === activeItem ? {display: ''} : {display: 'none'}
    const getStyleResultsTab = name => name === activeItem ? {display: 'flex'} : {display: 'none'}
    const getResultsStyle = name => name === activeResultsItem ? {display: ''} : {display: 'none'}

    const history = useHistory();

    const {recipeId} = useParams();

    const addLimits = (params) => {
        return {
            ...params,
            limit: props.limit,
            communityNodeLimit: props.communityNodeLimit
        }
    }

    const selectedRecipe = recipes[recipeId]
    const [selectedSlide, setSelectedSlide] = React.useState(0)
    const maxSlide = selectedRecipe.slides.length

    const group = selectedRecipe.slides[selectedSlide].group
    const algorithm = selectedRecipe.slides[selectedSlide].algorithm

    const {parameters, parametersBuilder} = getAlgorithmDefinitions(group, algorithm, props.metadata.versions.gdsVersion)

    const params = parametersBuilder({
        ...parameters,
        requiredProperties: Object.keys(parameters)
    })

    const formParameters = addLimits(parameters);
    const taskId = generateTaskId()

    const [task, setTask] = React.useState({
        group: group,
        algorithm: algorithm,
        status: ADDED,
        taskId,
        parameters: params,
        formParameters,
        persisted: false,
        startTime: new Date(),
        database: getActiveDatabase()
    })

    React.useEffect(() => {
        setTask({
            group: group,
            algorithm: algorithm,
            status: ADDED,
            taskId,
            parameters: params,
            formParameters,
            persisted: false,
            startTime: new Date(),
            database: getActiveDatabase()
        })
    }, [selectedSlide])

    const activeGroup = task && task.group

    const handleResultsMenuItemClick = (e, {name}) => {
        setActiveResultsItem(name)
    }

    console.log("task", task)

    return task && <React.Fragment>
        <nav className="top-nav">
            <Button onClick={() => {

                history.push("/recipes/")
            }} icon="left arrow" labelPosition="left" content="All algorithm recipes" className="back-to-algorithms"/>
        </nav>
        <div className="page-heading">
            {recipes[recipeId].name}
        </div>
        <div style={containerStyle}>
            <Container fluid>
                <p>{recipes[recipeId].shortDescription}</p>
                <div className="recipes">
                    <div className="recipe">
                        <div className="left">
                          <span className="recipe-heading">
                              {recipes[recipeId].slides[selectedSlide].title}
                          </span>
                            {recipes[recipeId].slides[selectedSlide].description}
                        </div>
                        <div className="right">
                            <SuccessTopBar task={task} panelRef={props.panelRef} activeItem={activeItem}
                                           activeGroup="Configure"
                                           handleMenuItemClick={(e, {name}) => setActiveItem(name)}
                            />
                            <div ref={panelRef}>
                                <div style={getStyle("Configure")}>
                                    <AlgoForm
                                        selectedAlgorithmReadOnly={true}
                                        task={task}
                                        limit={props.limit}
                                        onRun={(newParameters, formParameters, persisted) => {
                                            onRunAlgo(task, newParameters, formParameters, persisted, props.metadata.versions,
                                                (taskId, result, error) => {
                                                    setTask(task => {
                                                        return error ? {
                                                            ...task, result, status: FAILED
                                                        } : {
                                                            ...task, result, status: COMPLETED
                                                        };

                                                    })
                                                },
                                                () => {
                                                },
                                                (taskId, query, namedGraphQueries, parameters, formParameters, persisted) => {
                                                    setTask(task => {
                                                        return {
                                                            ...task,
                                                            status: RUNNING, query, namedGraphQueries, parameters, formParameters,
                                                            persisted,
                                                            result: null
                                                        }
                                                    })
                                                })
                                        }}
                                        onCopy={(group, algorithm, newParameters, formParameters) => {}}
                                    />
                                </div>

                                <div style={getStyleResultsTab("Results")}>
                                    <div>
                                        <Menu pointing secondary vertical className="resultsMenu">
                                            <Menu.Item
                                                name='Table'
                                                active={activeResultsItem === 'Table'}
                                                onClick={handleResultsMenuItemClick}
                                            />

                                            {getGroup(task.algorithm) === "Centralities" &&
                                            <Menu.Item
                                                name='Chart'
                                                active={activeResultsItem === 'Chart'}
                                                onClick={handleResultsMenuItemClick}
                                            />}

                                            {!(getGroup(task.algorithm) === 'Path Finding' || getGroup(task.algorithm) === 'Similarity') &&
                                            <Menu.Item
                                                name='Visualisation'
                                                active={activeResultsItem === 'Visualisation'}
                                                onClick={handleResultsMenuItemClick}
                                            />}

                                        </Menu>
                                    </div>
                                    <div style={{flexGrow: "1", paddingLeft: "10px"}}>
                                        {!(activeGroup === 'Path Finding' || activeGroup === 'Similarity') ?
                                            <div style={getResultsStyle('Visualisation')}>
                                                <VisView task={task} active={activeResultsItem === 'Visualisation'}/>
                                            </div> : null}

                                        {activeGroup === 'Centralities' ?
                                            <div style={getResultsStyle('Chart')}>
                                                <ChartView task={task} active={activeResultsItem === 'Chart'}/>
                                            </div> : null}

                                        <div style={getResultsStyle('Table')}>
                                            <TableView task={task} gdsVersion={props.gdsVersion}/>
                                        </div>
                                    </div>

                                </div>

                                <div style={getStyle('Code')}>
                                    <CodeView task={task}/>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="recipe-navigation">
                    {selectedSlide <= 0 && <Icon size="large" disabled={true} className="angle left disabled"/>}
                    {selectedSlide > 0 && <Icon size="large" onClick={() => setSelectedSlide(selectedSlide-1)} className="angle left"/>}
                    <span>Browse Algorithms</span>
                    {selectedSlide < (maxSlide-1) && <Icon size="large" className="angle right" onClick={() => setSelectedSlide(selectedSlide+1)}/>}
                    {!(selectedSlide < (maxSlide-1)) && <Icon size="large" className="angle right disabled" disabled={true}/>}

                </div>
            </Container></div>
    </React.Fragment>
}

const Recipes = (props) => {
    const history = useHistory();

    const {recipes} = props
    return  <CardGroup>
        {Object.keys(recipes).map(key => {
            return <Card key={key}>
                <Card.Content>
                    <Icon name='sitemap'/>
                    <Card.Header>
                        {recipes[key].name}
                    </Card.Header>
                    <Card.Meta>
                        {recipes[key].shortDescription}
                    </Card.Meta>
                </Card.Content>
                <Card.Content extra>
                    <div className='ui two buttons'>
                        <Button basic color='green'  onClick={() => history.push('/recipes/' + key)}>
                            Select
                        </Button>
                    </div>
                </Card.Content>
            </Card>
        })}
    </CardGroup>
}


const AlgoForm = connect(state => ({
    activeGroup: "Centralities",
    activeAlgorithm: "Degree",
    currentAlgorithm: getAlgorithmDefinitions("Centralities", "Degree", state.metadata.versions.gdsVersion),
    metadata: state.metadata,
    limit: state.settings.limit,
    communityNodeLimit: state.settings.communityNodeLimit,
}), dispatch => ({
    updateLimit: value => dispatch(limit(value)),
    updateCommunityNodeLimit: value => dispatch(communityNodeLimit(value)),
}))(AlgoFormView)



export const Recipe = connect(state => ({
    metadata: state.metadata,
    activeAlgorithm: state.algorithms.algorithm,
    limit: state.settings.limit,
}), dispatch => ({
    selectAlgorithm: group => dispatch(selectAlgorithm(group)),
}))(RecipeView)
