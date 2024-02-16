import React, { FC, useContext } from 'react'

import './TopPanel.sass'
import ErrorContext from '@/store/errorContext'

const TopPanel: FC = () => {
  const {errorMessage} = useContext(ErrorContext)

  return (
    <div className="top-panel">
      <p>
        DEVICE LIST
        { errorMessage && <span className="error">{errorMessage}</span> }
      </p>
    </div>
  )
}

export default TopPanel