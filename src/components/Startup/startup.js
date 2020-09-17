import {loadMetadata, loadVersions} from "../../services/metadata";
import {sendMetrics} from "../metrics/sendMetrics";
import {onNeo4jVersion} from "../../services/stores/neoStore";
import {selectCaption, selectRandomColor} from "../NodeLabel";
import constants from "../../constants";

export const ALL_DONE = "all-done";
export const CONNECTING_TO_DATABASE = "connect-server";
export const SELECT_DATABASE = "select-database";
export const CHECKING_GDS_PLUGIN = "gds";
export const CHECKING_APOC_PLUGIN = "apoc";
export const steps = [
    CONNECTING_TO_DATABASE, CHECKING_GDS_PLUGIN, CHECKING_APOC_PLUGIN, ALL_DONE
]

export const webAppSteps = [
    CONNECTING_TO_DATABASE, SELECT_DATABASE, CHECKING_GDS_PLUGIN, CHECKING_APOC_PLUGIN, ALL_DONE
]

export const setLimitDefaults = (props) => {
    props.updateLimit(constants.defaultLimit)
    props.updateCommunityNodeLimit(constants.defaultCommunityNodeLimit)
}

export const refreshMetadata = (props, firstConnection = false, finished = () => {}) => {
    loadVersions().then(versions => {
        if(firstConnection) {
            sendMetrics("neuler-connected", true, versions)
        }

        props.setGds(versions)
        onNeo4jVersion(versions.neo4jVersion)

        loadMetadata(versions.neo4jVersion).then(metadata => {
            updateMetadata(props, metadata)
            finished()
        })
    });
}

export const updateMetadata = (props, metadata) => {
    props.setLabels(metadata.labels)
    props.setRelationshipTypes(metadata.relationships)
    props.setPropertyKeys(metadata.propertyKeys)
    props.setNodePropertyKeys(metadata.nodePropertyKeys)
    props.setDatabases(metadata.databases)

    metadata.databases.forEach(database => {
        props.addDatabase(database.name)
    })

    metadata.labels.forEach(label => {
        props.initLabel(props.metadata.activeDatabase, label.label, selectRandomColor(), selectCaption(metadata.nodePropertyKeys[label.label]))
    })
}