import React, { useState } from "react";
import PropTypes from "prop-types";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import styled from "styled-components";


// Outer wrapper 
const OuterWrapper = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
  background-color: #e3f0ff; 
  padding: 20px;
  border-radius: 10px;
  width: 90%; 
  margin: 30px auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

`;

// Arrow buttons for scrolling (previous/next month)
const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: #ffff; 
  color: #a8b4ff;
  border: none;
  border-radius: 50%;   
  width: 48px;          
  height: 48px;
  font-size: 20px;      
  font-weight: bold;    
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  transition: all 0.2s;

  &:hover {
    background-color: #357ab8; 
  }

  &:disabled {
    background-color: #ccc;
    color: #888;
    cursor: not-allowed;
  }
`;

const LeftArrow = styled(ArrowButton)`left: -60px;`;
const RightArrow = styled(ArrowButton)`right: -60px;`;


// Table Header Cell
const StyledHeaderCell = styled(TableCell)`
  background-color: #6a89ff !important; 
  color: #fff !important; 
  font-weight: bold !important;
  text-align: center;
  border: 1px solid #fff !important;
  min-width: 80px;
  font-size: 14px;
`;

// Table Body Cell
const StyledTableCell = styled(TableCell)`
  background-color: #a8b4ff; 
  color: #000; 
  text-align: center;
  font-weight: bold !important;
  border: 1px solid #fff;
  padding: 8px !important;
  font-size: 14px;
`;

// Fixed left column for Month
const LeftColumnCell = styled(StyledTableCell)`
  min-width: 120px;
  font-weight: bold !important;
  background-color: #6a89ff; 
  color: #fff;
`;


const MonthlyIncidentSummary = ({ months, data, visibleCount = 3 }) => {
  const [startIndex, setStartIndex] = useState(0);

  const endIndex = startIndex + visibleCount;
  const visibleMonths = months.slice(startIndex, endIndex);

  const handleScroll = (direction) => {
    if (direction === "left" && startIndex > 0) setStartIndex(startIndex - 1);
    if (direction === "right" && endIndex < months.length) setStartIndex(startIndex + 1);
  };

  return (
    <OuterWrapper>
      <LeftArrow onClick={() => handleScroll("left")} disabled={startIndex === 0}>
        &lt;
      </LeftArrow>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <LeftColumnCell>Month</LeftColumnCell>
              {visibleMonths.map((month) => (
                <StyledHeaderCell key={month}>{month}</StyledHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {["BF", "Reported", "Cleared", "CF"].map((rowKey) => (
              <TableRow key={rowKey}>
                <LeftColumnCell>{rowKey}</LeftColumnCell>
                {visibleMonths.map((month) => {
                  const monthIndex = months.indexOf(month);
                  return (
                    <StyledTableCell key={`${rowKey}-${month}`}>
                      {data[rowKey][monthIndex] ?? "-"}
                    </StyledTableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <RightArrow onClick={() => handleScroll("right")} disabled={endIndex >= months.length}>
        &gt;
      </RightArrow>
    </OuterWrapper>
  );
};

MonthlyIncidentSummary.propTypes = {
  months: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.shape({
    Reported: PropTypes.arrayOf(PropTypes.number).isRequired,
    Cleared: PropTypes.arrayOf(PropTypes.number).isRequired,
    BF: PropTypes.arrayOf(PropTypes.number),
    CF: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
  visibleCount: PropTypes.number,
};

export default MonthlyIncidentSummary;
