import React, { Component } from 'react'
import { Button, Tab, Header, Icon, Segment, Menu } from 'semantic-ui-react'
import { connect } from "react-redux"
import GraphVisualiser from './GraphVisualiser'
import { getAlgorithmDefinitions } from "./algorithmsLibrary"

const tabContentStyle = {
  height: '85vh',
  overflowY: 'auto',
  overflowX: 'hidden'
}

const TableView = ({ task }) => {
  const { ResultView } = getAlgorithmDefinitions(task.group, task.algorithm)
  return <div style={tabContentStyle}>
    <ResultView task={task}/>
  </div>
}

const CodeView = ({ task }) => (
  <div style={tabContentStyle}>
    {
      task.parameters
        ? <Segment>

          {
            Object.keys(task.parameters).map(key =>
              <pre key={key}>:param {key} =>
                {task.parameters[key]
                  ? (typeof task.parameters[key] === 'string'
                    ? ` '${task.parameters[key]}'`
                    : ` ${task.parameters[key]}`)
                  : ' null'};
                </pre>
            )}
        </Segment>
        : null
    }


    <Segment>
      <pre>{task.query && task.query.replace('\n  ', '\n')}</pre>
    </Segment>
  </div>
)

const VisView = ({ task, active }) => (
  <div style={tabContentStyle}>
    <GraphVisualiser taskId={task.taskId} results={task.result} label={task.parameters.label} active={active} algorithm={task.algorithm}
                     relationshipType={task.parameters.relationshipType}
                     writeProperty={task.parameters.writeProperty}/>
  </div>
)

class HorizontalAlgoTab extends Component {
  state = {
    activeItem: 'Table'
  }

  handleMenuItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const { task, prevResult, nextResult, currentPage, totalPages } = this.props
    const { activeItem } = this.state

    const getStyle = name => name === activeItem
      ? ({
        display: ''
      })
      : ({
        display: 'none'
      })

    return (
      <div style={{ paddingTop: '1em' }}>
        <Menu attached='top' tabular>
          <Menu.Item name='Table' active={activeItem === 'Table'}
                     onClick={this.handleMenuItemClick.bind(this)}></Menu.Item>
          <Menu.Item name='Code' active={activeItem === 'Code'}
                     onClick={this.handleMenuItemClick.bind(this)}></Menu.Item>
          <Menu.Item name='Visualisation' active={activeItem === 'Visualisation'}
                     onClick={this.handleMenuItemClick.bind(this)}></Menu.Item>
        </Menu>
        <Segment attached='bottom'>
          <div style={getStyle('Table')}>
            <TableView task={task}/>
          </div>
          <div style={getStyle('Code')}>
            <CodeView task={task}/>
          </div>
          <div style={getStyle('Visualisation')}>
            <VisView task={task} active={activeItem === 'Visualisation'}/>
          </div>
        </Segment>

        <div style={{
          position: 'absolute',
          top: '1.5em',
          left: '30em',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Button basic icon size='mini' onClick={prevResult} disabled={currentPage === 1}>
            <Icon name='angle left'/>
          </Button>
          <Header as='h3' style={{ margin: '0 1em' }}>
            {`${task.algorithm} Started at: ${task.startTime.toLocaleTimeString()} - (${currentPage} / ${totalPages})`}
          </Header>
          <Button basic icon size='mini' onClick={nextResult} disabled={currentPage === totalPages}>
            <Icon name='angle right'/>
          </Button>
        </div>
      </div>
    )
  }
}

class TabExampleVerticalTabular extends Component {
  state = {
    page: 0
  }

  prevResult() {
    this.setState(({ page }) => ({ page: Math.max(0, page - 1) }))
  }

  nextResult() {
    const length = (this.props.tasks || []).length
    this.setState(({ page }) => ({ page: Math.min(length - 1, page + 1) }))
  }

  render() {
    const tasks = this.props.tasks
    const page = this.state.page
    if (tasks && tasks.length > 0) {
      const currentTask = tasks[this.state.page]
      return <HorizontalAlgoTab
        task={currentTask}
        prevResult={this.prevResult.bind(this)}
        nextResult={this.nextResult.bind(this)}
        currentPage={page + 1}
        totalPages={tasks.length}
      />
    } else {
      return null
    }
  }
}

const mapStateProps = state => ({
  tasks: state.tasks
})

export default connect(mapStateProps, null)(TabExampleVerticalTabular)
