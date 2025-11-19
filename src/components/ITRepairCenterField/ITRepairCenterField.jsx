import React from 'react';
import './ITRepairCenterField.css';
import { MdArrowDropDown } from "react-icons/md";

const ITRepairCenterFields = () => {
  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-body">
          <h5>IT Repair Center Fields</h5>
          <div className="form-row">
            <div className="form-group col-md-4">
              <label htmlFor="serialNumber">Serial Number</label>
              <input type="text" className="form-control" id="serialNumber" />
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="costCenterCode">Cost Center Code</label>
              <input type="text" className="form-control" id="costCenterCode" />
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="warranty">Warranty  <MdArrowDropDown className="dropdown-icon" />  </label>
              <select className="form-control" id="warranty" >
                <option value="">Select Warranty   </option>
               
              </select>
            </div>
          </div>
          <div className="form-row">
          <div className="form-group col-md-4">
              <label htmlFor="warranty"> Dealer  <MdArrowDropDown className="dropdown-icon" />  </label>
              <select className="form-control" id="warranty" >
                <option value="">Select Dealer   </option>
               
              </select>
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="repairCenter">Cost</label>
              <input type="text" className="form-control" id="repairCenter" />
            </div>

            <div className="form-group col-md-4">
              <label htmlFor="warranty"> Repair Center  <MdArrowDropDown className="dropdown-icon" />  </label>
              <select className="form-control" id="warranty" >
                <option value="">Repair Center   </option>
               
              </select>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ITRepairCenterFields;