import React from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import {MenuItem} from 'material-ui/Menu';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import {withStyles} from 'material-ui/styles';
import suggestions from './suggestions.js'
import {Input} from 'semantic-ui-react'

let frontvalue = ''

function renderInput(inputProps) {
    const {classes, autoFocus, value, ref, onEnter, ...other} = inputProps;

    return (
        <TextField
            autoFocus={autoFocus}
            value={value}
            inputRef={ref}
            onKeyPress={(event) => {
                if (event.key === 'Enter' && value !== '') {
                    onEnter();
                    event.preventDefault();
                }
            }}
            InputProps={{
                disableUnderline: true,
                classes: {
                    root: classes.textFieldRoot,
                    input: classes.textFieldInput,
                },
                ...other,
            }}
            InputLabelProps={{
                shrink: true,
                className: classes.textFieldFormLabel,
            }}
        />
    )

}

function renderSuggestion(suggestion, {query, isHighlighted}) {
    const matches = match(suggestion.label, query);
    const parts = parse(suggestion.label, matches);
    return (
        <MenuItem selected={isHighlighted} component="div">
            <div>
                {parts.map((part, index) => {
                    return part.highlight ? (
                        <span key={index} style={{fontWeight: 300}}>
              {part.text}
            </span>
                    ) : (
                        <strong key={index} style={{fontWeight: 500}}>
                            {part.text}
                        </strong>
                    );
                })}
            </div>
        </MenuItem>
    );
}

function renderSuggestionsContainer(options) {
    const {containerProps, children} = options;

    return (
        <Paper style={{maxHeight: 250, overflow: 'auto'}} {...containerProps} square>
            {children}
        </Paper>
    );
}

function getSuggestionValue(suggestion) {
    // console.log("suggestion.label",suggestion.label)
    // let addentity = '#_entity_' + suggestion.label.substr(1).split(' ').join('_').toLowerCase()
    // // console.log("front", frontvalue)
    // let query = frontvalue + addentity
    return suggestion.label;
}

function getSuggestions(value) {
    var inputValue = value.trim().toLowerCase();
    // frontvalue =  inputValue.substr(0, inputValue.indexOf('#_entity_'))
    // console.log(inputValue.indexOf('#_entity_'))
    inputValue = inputValue.substr(inputValue.indexOf('#'))
    // console.log("inputvalue",inputValue)
    const inputLength = inputValue.length;
    let count = 0;

    return inputLength === 0
        ? []
        : suggestions.filter(suggestion => {
            const keep =
                suggestion.label.toLowerCase().slice(0, inputLength) === inputValue;

            if (keep) {
                count += 1;
            }
            return keep;
        });
}

const styles = theme => ({
    container: {
        flexGrow: 1,
        position: 'relative',

        // height: 200
    },
    suggestionsContainerOpen: {
        position: 'absolute',
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit * 3,
        left: 0,
        right: 0,
        zIndex: '1000'
    },
    suggestion: {
        display: 'block',

    },
    suggestionsList: {

        margin: 0,
        padding: 0,
        listStyleType: 'none',
    },
    textFieldRoot: {
        padding: '0px 15px 0px 0px',
        width: '140%'
    },
    textFieldInput: {
        borderRadius: 4,
        background: theme.palette.common.white,
        border: '0px solid #ced4da',
        fontSize: 14,
        padding: '10px 5px 10px 5px',
        width: '100%',
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        '&:focus': {
            borderColor: '#80bdff',
            boxShadow: '0 0 0 0.05rem rgba(0,123,255,.25)',
        },
    },
});

class IntegrationAutosuggestDocument extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            values: [],
            suggestions: [],
        }
        this.handleSuggestionsFetchRequested = this.handleSuggestionsFetchRequested.bind(this);
        this.handleSuggestionsClearRequested = this.handleSuggestionsClearRequested.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.addInputBox = this.addInputBox.bind(this);
    }

    handleSuggestionsFetchRequested({value}) {
        // console.log("fetch ", value)
        this.setState({
            suggestions: getSuggestions(value),
        });
    };

    handleSuggestionsClearRequested() {
        this.setState({
            suggestions: [],
        });
    };

    handleChange(event, {newValue}) {
        let tmp = [...this.state.values];
        let id = event.target.id.split("-");
        // console.log(id[id.length-1]);
        tmp[Number(id[id.length - 1])] = newValue;
        this.setState({
            values: tmp,
        });
        this.props.onUpdateValue(tmp);
    };

    addInputBox(event) {
        let tmp = [...this.state.values];
        tmp.push("");
        this.setState({
            values: tmp,
        });
        this.props.onUpdateValue(tmp);
    }

    render() {
        const {classes, onEnter, searchValues} = this.props;
        const inputBoxes = [];
        this.state.values = searchValues;
        for (var i = 0; i < this.state.values.length; i++) {
            inputBoxes.push(
                <tr key={i}>
                    <td>
                        <input type="checkbox" name={"filter-" + i}/>
                    </td>
                    <td>
                        <Autosuggest
                            theme={{
                                container: classes.container,
                                suggestionsContainerOpen: classes.suggestionsContainerOpen,
                                suggestionsList: classes.suggestionsList,
                                suggestion: classes.suggestion,
                            }}
                            renderInputComponent={renderInput}
                            suggestions={this.state.suggestions}
                            onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
                            onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
                            renderSuggestionsContainer={renderSuggestionsContainer}
                            getSuggestionValue={getSuggestionValue}
                            renderSuggestion={renderSuggestion}
                            inputProps={{
                                onEnter: onEnter,
                                autoFocus: true,
                                classes,
                                placeholder: 'Type keywords or #entity or both here',
                                value: searchValues[i],
                                onChange: this.handleChange,
                                id: "es-input-" + i,
                            }}
                        />
                    </td>
                </tr>)
        }

        return (
            <span>
          <table>
              <tbody>
                  {inputBoxes}
                  <tr>
                  <td></td>
                  <td id="es-side-add-more">
                      <a href="#es-side-header" onClick={this.addInputBox}>Add more filters</a>
                  </td>
                  </tr>
              </tbody>
          </table>
      </span>
        );
    }
}

IntegrationAutosuggestDocument.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(IntegrationAutosuggestDocument);