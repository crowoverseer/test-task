import React, { EventHandler, FC, useCallback, useEffect, useState } from 'react'
import { Formik, Field } from 'formik';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Col } from 'reactstrap';
import { object } from 'yup';

import { IDevice } from '@/resources/device/device.types';

import "./DeviceModal.sass"

interface IFormItems {
  UID: IDevice['UID']
  vendor: IDevice['vendor']
  status: boolean
}

export interface IDeviceModalProps {
  device: IDevice | null;
  onSave?: (device: Partial<IDevice>) => void;
  onCancel?: EventHandler<any>;
  onDelete?: EventHandler<any>;
}

const validationSchema = object().shape({
})

const DeviceModal: FC<IDeviceModalProps> = ({
  device,
  onSave = () => {},
  onCancel = () => {},
  onDelete = () => {}
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect( () => {
    if(!device) {
      setIsOpen( false )
    } else {
      setIsOpen( true )
    }
  }, [device, setIsOpen])

  const submitHandler = useCallback( ({UID, vendor, status}: IFormItems) => {
    onSave({
      UID,
      vendor,
      status: status ? "online" : "offline"
    })
  }, [onSave])

  if( !device ) {
    return <></>
  }

  return (
    <Modal isOpen={isOpen} toggle={onCancel}>
      <ModalHeader toggle={onCancel}>{device.deviceID !== "new" ? "Edit" : "Add"} Device</ModalHeader>
      <Formik
          initialValues={{
            UID: device.UID ?? "",
            vendor: device.vendor ?? "",
            status: device.status === "online",
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
                    <Label for="UID" sm={2}>UID:</Label>
                    <Col sm={10}>
                      <Input
                        name="UID"
                        tag={Field}
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="vendor" sm={2}>Vendor</Label>
                    <Col sm={10}>
                      <Input
                        name="vendor"
                        tag={Field}
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="status" sm={2}>Status</Label>
                    <Col sm={10}>
                      <div className="form-check form-switch switch">
                      <Input
                        type="checkbox"
                        className="form-check-input"
                        role="switch"
                        name="status"
                        tag={Field}
                        color="success"
                      />
                    </div>
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

export default DeviceModal