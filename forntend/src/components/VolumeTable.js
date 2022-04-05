import React from "react";
import {
  TextField,
  IconButton,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  Slider,
} from "@material-ui/core";
import IndeterminateCheckBoxIcon from "@material-ui/icons/IndeterminateCheckBox";
import update from "immutability-helper";

const VolumeTable = ({ data, handleChange }) => {
  const marks = [
    {
      value: 1,
      label: "1",
    },
    {
      value: 2,
      label: "2",
    },
    {
      value: 4,
      label: "4",
    },
    {
      value: 8,
      label: "8",
    },
    {
      value: 12,
      label: "12",
    },
    {
      value: 16,
      label: "16",
    },
  ];

  const drawTable = () => {
    return data.map((value, index) => (
      <TableRow key={index}>
        <TableCell style={{ width: "45%" }}>
          <TextField
            fullWidth={true}
            value={value.key ? value.key : ""}
            placeholder={"Volume path"}
            onChange={(event) => {
              handleChange(
                "volumes",
                update(data, {
                  [index]: {
                    $set: { key: event.target.value, value: data[index].value },
                  },
                })
              );
            }}
          />
        </TableCell>
        <TableCell style={{ width: "45%" }}>
          <Slider
            value={value.value ? value.value : 1}
            getAriaValueText={(value) => `${value} Gb`}
            step={0.5}
            min={0.5}
            max={16}
            valueLabelDisplay="auto"
            marks={marks}
            onChange={(event, value) =>
              handleChange(
                "volumes",
                update(data, {
                  [index]: {
                    $set: { key: data[index].key, value: value },
                  },
                })
              )
            }
          />
        </TableCell>
        <TableCell>
          <IconButton
            onClick={() => {
              handleChange("volumes", update(data, { $splice: [[index, 1]] }));
            }}
            disabled={data.length <= 1}
          >
            <IndeterminateCheckBoxIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div>
      <TableContainer>
        <Table style={{ marginTop: "30px" }}>
          <TableBody>{drawTable()}</TableBody>
        </Table>
      </TableContainer>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: "20px", width: "120px" }}
          onClick={() => {
            handleChange("volumes", update(data, { $push: [{}] }));
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default VolumeTable;
