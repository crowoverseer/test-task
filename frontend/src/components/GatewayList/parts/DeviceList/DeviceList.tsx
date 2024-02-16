import React, { FC, useCallback, useContext, useMemo, useState } from 'react'
import { ListGroup, ListGroupItem } from 'reactstrap';
import omit from 'lodash/omit';

import { IDevice } from '@/resources/device/device.types';
import DeviceModal from '../DeviceModal';
import { useDeviceTransport } from '@/resources/device/deviceResource';

import "./DeviceList.sass"
import { IGateway } from '@/resources/gateway/gateway.types';
import ErrorContext from '@/store/errorContext';

export interface IDeviceListProps {
  gatewayID: IGateway['ID'];
  devices: IDevice[];
}

const DeviceList: FC<IDeviceListProps> = ({gatewayID, devices}) => {
  const [ selectedDevice, setSelectedDevice ] = useState<IDevice | null>(null);
  const { usePatch, useDelete, usePost } = useDeviceTransport()
  const { patch } = usePatch(gatewayID, selectedDevice?.deviceID)
  const { remove } = useDelete(gatewayID, selectedDevice?.deviceID)
  const { post } = usePost(gatewayID)
  const { setErrorMessage } = useContext(ErrorContext)

  const handleDeviceClick = useCallback( (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    let target = event.target as HTMLElement | undefined
    if (target.tagName !== "BUTTON") {
      return;
    }
    const deviceID = target.id
    setSelectedDevice(devices.find((device: IDevice) => device.deviceID.toString() === deviceID));
  }, [setSelectedDevice, devices])

  const handleSaveGateway = useCallback( (device: IDevice) => {
    setErrorMessage("")
    if( selectedDevice.deviceID === "new" ) {
      post(omit(device, 'deviceId'))
    } else {
      patch(device)
    }
    setSelectedDevice(null)
  }, [setSelectedDevice, patch, post, selectedDevice, setErrorMessage] )
  const handleCancelDevice = useCallback( () => {
    setSelectedDevice(null)
  }, [setSelectedDevice] )
  const handleDeleteDevice = useCallback( () => {
    remove()
    setSelectedDevice(null)
  }, [setSelectedDevice, remove] )

  const deviceList = useMemo( () => {
    const result = devices
      .sort((a,b) => a.UID - b.UID)
      .map( device => (
        <ListGroupItem className="device" onClick={handleDeviceClick} key={device.deviceID}>
          <div className="grid">
            <p>UID: {device.UID}</p>
            <p>Date Created: {new Date(device.dateCreated).toISOString().slice(0, 10)}</p>
            <p>Vendor: {device.vendor || "Unknown"}</p>
            <p>Status: <span className={`${device.status || ""}`}>{device.status || "unknown"}</span></p>
            <div className="button-wrapper">
              <button id={device.deviceID.toString()} />
            </div>
          </div>
        </ListGroupItem>
      ));
    if( result instanceof Array ) {
      result.push((
        <ListGroupItem className="gateway no-expand" key="add" onClick={() => setSelectedDevice({deviceID: "new"})}>
          <div className="add small"/>
        </ListGroupItem>)
      )
    }
    return result;
  }, [devices, handleDeviceClick])
  return (
    <>
      <ListGroup onClick={() => {}} className="device-list">
        {deviceList}
      </ListGroup>
      <DeviceModal device={selectedDevice} onCancel={handleCancelDevice} onDelete={handleDeleteDevice} onSave={handleSaveGateway}/>
    </>
  )
}

export default DeviceList