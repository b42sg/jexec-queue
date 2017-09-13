import React from 'react'

const BlockUI = () => (
  <div
    style={{
      zIndex: '1000',
      border: 'none',
      margin: '0px',
      padding: '0px',
      width: '100%',
      height: '100%',
      top: '0px',
      left: '0px',
      backgroundColor: 'rgb(0, 0, 0)',
      opacity: '0.6',
      cursor: 'wait',
      position: 'fixed'
    }}
  />
)

export default BlockUI