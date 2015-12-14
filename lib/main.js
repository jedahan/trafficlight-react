//require('babel-polyfill')
import React from 'react'
import update from 'react-addons-update'
import ReactDOM from 'react-dom'
import spark from 'spark'

class Light extends React.Component {
  handleClick = () => {
    this.state.device.callFunction('ledToggle', this.props.pin)
  }

  render() {
    return <button onClick={this.handleClick} className={this.props.on ? 'on' : 'off'}> { this.props.color } </button>;
  }
}

class TrafficLight extends React.Component {
  constructor(props) {
    super(props)
    this.state = {'lights': {
      0: {color: "red", on: false},
      1: {color: "yellow", on: false},
      2: {color: "green", on: false}
    }}
  }

  componentDidMount() {
    spark.login({accessToken: '7fcc04bfd1c4450eed1c1c91ec3e3ec09a3fa9c6'}, (err, body) => {
      if (err) { throw err }
      spark.listDevices((err, devices) => {
        for (let device of devices) {
          if (device.name == 'pizza_zombie') {
            this.setState({'device': device})
            device.callFunction('getStatus')
            device.subscribe('led', (data) => {
              const pin = parseInt(data.data)
              const on = data.name==`ledOn`
              this.setState(update(this.state, { 'lights': {[pin]: {on: {$set: on}}}}))
              console.log(this.state)
            })
          }
        }
      })
    })
  }

  render() {
    let tl = this.state['lights']
    const lights = Object.keys(tl).map((key) => <Light device={this.state.device} pin={key} on={tl[key].on} color={tl[key].color} />)
    return <div id="trafficlight">{lights}</div>
  }
}

ReactDOM.render(<TrafficLight />, document.getElementById('trafficlight'))
