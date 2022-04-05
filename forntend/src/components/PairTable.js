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
} from "@material-ui/core";
import IndeterminateCheckBoxIcon from "@material-ui/icons/IndeterminateCheckBox";
import update from "immutability-helper";

const PairTable = ({ data, handleChange, changeName }) => {
  const keyPlaceHolder =
    changeName === "envs" ? "Environment name" : "Host port";

  const valuePlaceHolder =
    changeName === "envs" ? "Environment value" : "Container port";

  const drawTable = () => {
    return data.map((value, index) => (
      <TableRow key={index}>
        <TableCell style={{ width: "45%" }}>
          <TextField
            fullWidth={true}
            value={value.key ? value.key : ""}
            placeholder={keyPlaceHolder}
            onChange={(event) => {
              handleChange(
                changeName,
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
          <TextField
            fullWidth={true}
            value={value.value ? value.value : ""}
            placeholder={valuePlaceHolder}
            onChange={(event) => {
              handleChange(
                changeName,
                update(data, {
                  [index]: {
                    $set: { key: data[index].key, value: event.target.value },
                  },
                })
              );
            }}
          />
        </TableCell>
        <TableCell>
          <IconButton
            onClick={() => {
              handleChange(changeName, update(data, { $splice: [[index, 1]] }));
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
            handleChange(changeName, update(data, { $push: [{}] }));
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default PairTable;
