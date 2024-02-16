import React, { FC, useCallback, useContext, useMemo, useState } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import omit from 'lodash/omit';

import ErrorContext from '@/store/errorContext';
import { useGatewayTransport } from '@/resources/gateway/gatewayResource';
import GatewayModal from './parts/GatewayModal';
import DeviceList from './parts/DeviceList';

import { IGateway } from '@/resources/gateway/gateway.types';

import "./GatewayList.sass"

const getParentTo = ( target: HTMLElement, parentTag: string ): HTMLElement => {
  if( target?.tagName !== parentTag) {
    return getParentTo(target.parentElement, parentTag )
  }
  return target
}

const GatewayList: FC = () => {
  const { useGet, usePatch, useDelete, usePost} = useGatewayTransport()
  const { gateways, loading } = useGet();
  const [ selectedGateway, setSelectedGateway ] = useState<IGateway | null>(null);
  const [ expandedGatewayIDs, setExpandedGatewayIDs ] = useState<IGateway['ID'][]>([])
  const { patch } = usePatch(selectedGateway);
  const { remove } = useDelete(selectedGateway?.ID);
  const { post } = usePost();
  const { setErrorMessage } = useContext(ErrorContext)

  const toggleGateway = useCallback( (id: IGateway['ID'] ) => {
    const found = expandedGatewayIDs.some( gatewayID => gatewayID === id);
    if( found ) {
      setExpandedGatewayIDs( expandedGatewayIDs.filter( gatewayID => gatewayID !== id ) )
    } else {
      setExpandedGatewayIDs( [...expandedGatewayIDs, id ] );
    }
  }, [expandedGatewayIDs, setExpandedGatewayIDs] );

  const handleGatewayClick = useCallback( (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    let target = event.target as HTMLElement | undefined
    if (target?.tagName !== "BUTTON") {
      target = getParentTo( target, "LI" );
      toggleGateway(Number(target.id))
      return;
    }
    if( target.className !== "gateway-btn") {
      return;
    }
    const gatewayID = target.id
    setSelectedGateway(gateways.find((gateway: IGateway) => gateway.ID.toString() === gatewayID));
  }, [setSelectedGateway, gateways, toggleGateway])

  const handleSaveGateway = useCallback( (gateway: IGateway) => {
    setErrorMessage("")
    if( selectedGateway.ID !== "new" ) {
      patch(gateway)
    } else {
      post(omit(gateway, "ID"))
    }
    setSelectedGateway(null)
  }, [setSelectedGateway, patch, post, selectedGateway, setErrorMessage] )
  const handleCancelGateway = useCallback( () => {
    setSelectedGateway(null)
  }, [setSelectedGateway] )
  const handleDeleteGateway = useCallback( () => {
    remove()
    setSelectedGateway(null)
  }, [setSelectedGateway, remove] )

  const gatewayList = useMemo( () => {
    const result =
      loading
        ? <></>
        : gateways
          .sort((a,b) => a.serial.localeCompare(b.serial))
          .map( (gateway: IGateway) =>
            <ListGroupItem
              className={`gateway ${expandedGatewayIDs.some( gatewayID => gatewayID === gateway?.ID) && "expanded"}`}
              key={gateway?.ID}
              id={gateway?.ID?.toString()}
            >
              <div className="grid">
                <p>Name: {gateway.name || "No name"}</p>
                <p>Serial: {gateway.serial || "No serial"}</p>
                <p>IP: {gateway.ipv4}</p>
                <div className="button-wrapper">
                  <button id={gateway.ID.toString()} className="gateway-btn"/>
                </div>
              </div>
              {
                expandedGatewayIDs.some( gatewayID => gatewayID === gateway.ID)
                  ? <DeviceList devices={gateway.devices} gatewayID={gateway.ID}/>
                  : <p className="hidden"></p>
              }
            </ListGroupItem>
        )
      if( result instanceof Array ) {
        result.push((
          <ListGroupItem className="gateway no-expand" key="add" onClick={() => setSelectedGateway({ID: "new"})}>
            <div className="add"/>
          </ListGroupItem>)
        )
      }
      return result
    }, [gateways, loading, expandedGatewayIDs])


  return (
    <>
      <ListGroup className="gateway-list" onClick={handleGatewayClick}>
        {gatewayList}
      </ListGroup>
      <GatewayModal
        gateway={selectedGateway}
        onSave={handleSaveGateway}
        onCancel={handleCancelGateway}
        onDelete={handleDeleteGateway}
      />
    </>
  )
}

export default GatewayList