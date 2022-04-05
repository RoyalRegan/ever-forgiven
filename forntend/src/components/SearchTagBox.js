import React, { useState, useCallback } from "react";
import { Autocomplete } from "@material-ui/lab";
import { TextField } from "@material-ui/core";
import debounce from "lodash/debounce";

//TODO: test more (libray/posrgtres 11.2 case)
const SearchTagBox = ({ image, handleChange, value }) => {
  const [options, setOptions] = useState([]);

  //TODO: handle 404
  const fetchTags = async (event) => {
    if (image !== undefined) {
      const urlParams = new URLSearchParams({
        page_size: "25",
        page: "1",
        name: event.target.value,
      });
      const url = `https://hub.docker.com/v2/repositories/${image}/tags?${urlParams}`;
      const response = await fetch(url);
      if (response.status === 200) {
        const data = await response.json();
        const tags = data["results"].map((it) => it["name"]);
        setOptions(tags);
      }
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChange = useCallback(debounce(fetchTags, 500), [options]);

  const onInputChange = (event, value, reason) => {
    handleChange("tag", value);
  };

  /*   useEffect(() => {
    handleChange("tag", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]); */

  return (
    <Autocomplete
      id="search-tag-box"
      options={options}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Tag (optional)"
          placeholder="Default tag: latest"
          variant="outlined"
          defaultValue={value}
          onChange={onChange}
        />
      )}
      defaultValue={value}
      noOptionsText="Tags not found"
      onInputChange={onInputChange}
    />
  );
};

export default SearchTagBox;
