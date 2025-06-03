import React from 'react'

const propTypes = {}

function Card({ children, className }) {
  return (
    <div className={`${className || ''} card`} >
      {children}
    </div>
  )
}

Card.propTypes = propTypes

export default Card