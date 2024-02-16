import React, { EventHandler, FC, useCallback, useEffect, useState } from 'react'
import { Formik, Field, ErrorMessage } from 'formik';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Col } from 'reactstrap';
import { object, string } from 'yup';

import { IGateway } from '@/resources/gateway/gateway.types';

import "./GatewayModal.sass"

interface IFormItems {
  serial: IGateway['serial']
  gatewayName: IGateway['name']
  ipv4: IGateway['ipv4']
}

export interface IGatewayModalProps {
  gateway: IGateway | null;
  onSave?: (gateway: Partial<IGateway>) => void;
  onCancel?: EventHandler<any>;
  onDelete?: EventHandler<any>;
}

const validationSchema = object().shape({
  ipv4: string()
  .matches(/(^(\d{1,3}\.){3}(\d{1,3})$)/, { message:'Invalid IP address', excludeEmptyString: true })
  .test('ipAddress', 'IP address value should be less or equal to 255',
    value => {
      if(value === undefined || value.trim() === '') return true;
      return value.split('.').find(i => parseInt(i) > 255) === undefined;
    }
  )
  .required("Should be filled")
})

const GatewayModal: FC<IGatewayModalProps> = ({
  gateway,
  onSave = () => {},
  onCancel = () => {},
  onDelete = () => {}
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect( () => {
    if(!gateway) {
      setIsOpen( false )
    } else {
      setIsOpen( true )
    }
  }, [gateway, setIsOpen])

  const submitHandler = useCallback( ({serial, gatewayName, ipv4}: IFormItems) => {
    onSave({
      serial,
      name: gatewayName,
      ipv4
    })
  }, [onSave])

  if( !gateway ) {
    return <></>
  }

  return (
    <Modal isOpen={isOpen} toggle={onCancel}>
      <ModalHeader toggle={onCancel}>{gateway.ID !== "new" ? "Edit" : "Add"} Gateway</ModalHeader>
      <Formik
          initialValues={{
            ipv4: gateway.ipv4 ?? "",
            serial: gateway.serial ?? "",
            gatewayName: gateway.name ?? "",
          }}
          onSubmit={submitHandler}
          validationSchema={validationSchema}
          validateOnMount={true}
      >
        {
          ({handleSubmit, errors, touched}) => (
            <>
              <ModalBody>
                <Form>
                  <FormGroup row>
                    <Label for="serial" sm={2}>Serial:</Label>
                    <Col sm={10}>
                      <Input
                        name="serial"
                        tag={Field}
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="gatewayName" sm={2}>Name</Label>
                    <Col sm={10}>
                      <Input
                        name="gatewayName"
                        tag={Field}
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="ipv4" sm={2}>IPv4</Label>
                    <Col sm={10}>
                      <Input
                        name="ipv4"
                        tag={Field}
                        placeholder="X.X.X.X"
                        invalid={(errors as any).ipv4 && (touched as any).ipv4}
                      />
                    </Col>
                    <Col>
                      <ErrorMessage
                        name="ipv4"
                        component="span"
                        className="errorMessage"
                      />
                    </Col>
                  </FormGroup>
                </Form>
              </ModalBody>
              <ModalFooter className="modal-buttons">
                <Button color="danger" onClick={onDelete}>
                    Delete
                  </Button>{' '}
                <div>
                  <Button color="success" onClick={(handleSubmit as any)}>
                    Save
                  </Button>{' '}
                  <Button color="secondary" onClick={onCancel}>
                    Cancel
                  </Button>
                </div>
              </ModalFooter>
            </>
          )
        }
      </Formik>
    </Modal>
  )
}

export default GatewayModal