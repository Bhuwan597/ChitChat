import React from 'react'
import './activeBadge.css'

const ActiveBadge = ({status}) => {
  return (
    <div className={`pill ${status}`}>
    <div class="dot"></div>
    {status.toUpperCase()}
  </div>
  )
}

export default ActiveBadge