import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

import DataDrivenSelect from '@data-driven-forms/common/src/select';
import parseInternalValue from '@data-driven-forms/common/src/select/parse-internal-value';
import Downshift from 'downshift';
import { CaretDownIcon, CloseIcon, CircleNotchIcon } from '@patternfly/react-icons';

import './select-styles.scss';
import Menu from './menu';
import ClearIndicator from './clear-indicator';
import ValueContainer from './value-container';

const itemToString = (value, isMulti, showMore, handleShowMore, handleChange) => {
  if (!value) {
    return '';
  }

  if (Array.isArray(value)) {
    if (!value || value.length === 0) {
      return;
    }

    if (isMulti) {
      const visibleOptions = showMore ? value : value.slice(0, 3);
      return (
        <div className="pf-c-chip-group" onClick={(event) => event.stopPropagation()}>
          <ul className="pf-c-chip-group__list" aria-label="Chip group category">
            {visibleOptions.map((item, index) => {
              const label = typeof item === 'object' ? item.label : item;
              return (
                <li className="pf-c-chip-group__list-item" onClick={(event) => event.stopPropagation()} key={item.key || item.value || item}>
                  <div className="pf-c-chip">
                    <span className="pf-c-chip__text" id={`pf-random-id-${index}-${label}`}>
                      {label}
                    </span>
                    <button onClick={() => handleChange(item)} className="pf-c-button pf-m-plain" type="button">
                      <CloseIcon />
                    </button>
                  </div>
                </li>
              );
            })}
            {value.length > 3 && (
              <li className="pf-c-chip-group__list-item">
                <button type="button" onClick={handleShowMore} className="pf-c-chip pf-m-overflow">
                  <span className="pf-c-chip__text">{showMore ? 'Show less' : `${value.length - 3} more`}</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      );
    }

    return value.map((item) => (typeof item === 'object' ? item.label : item));
  }

  if (typeof value === 'object') {
    return value.label;
  }

  return value;
};

const filterOptions = (options, filterValue = '') => options.filter(({ label }) => label.toLowerCase().includes(filterValue.toLowerCase()));

const getValue = (isMulti, option, value) => {
  if (!isMulti || !option) {
    return option;
  }

  const isSelected = value.find(({ value }) => value === option.value);
  return isSelected ? value.filter(({ value }) => value !== option.value) : [...value, option];
};

const stateReducer = (state, changes, keepMenuOpen) => {
  switch (changes.type) {
    case Downshift.stateChangeTypes.keyDownEnter:
    case Downshift.stateChangeTypes.clickItem:
      return {
        ...changes,
        isOpen: keepMenuOpen ? state.isOpen : !state.isOpen,
        highlightedIndex: state.highlightedIndex,
        inputValue: state.inputValue // prevent filter value change after option click
      };
    case Downshift.stateChangeTypes.controlledPropUpdatedSelectedItem:
      return {
        ...changes,
        inputValue: state.inputValue
      };
    default:
      return changes;
  }
};

const InternalSelect = ({
  noResultsMessage,
  noOptionsMessage,
  onChange,
  options,
  value,
  simpleValue,
  placeholder,
  isSearchable,
  isDisabled,
  isClearable,
  isMulti,
  isFetching,
  onInputChange,
  loadingMessage,
  menuPortalTarget,
  menuIsPortal,
  ...props
}) => {
  const [showMore, setShowMore] = useState(false);
  const inputRef = useRef();
  const selectToggleRef = useRef();
  const parsedValue = parseInternalValue(value);
  const handleShowMore = () => setShowMore((prev) => !prev);
  const handleChange = (option) => onChange(getValue(isMulti, option, value));
  return (
    <Downshift
      id={props.id || props.name}
      onChange={handleChange}
      itemToString={(value) => itemToString(value, isMulti, showMore, handleShowMore, handleChange)}
      selectedItem={value || ''}
      stateReducer={(state, changes) => stateReducer(state, changes, isMulti)}
      onInputValueChange={(inputValue) => {
        if (onInputChange && typeof inputValue === 'string') {
          onInputChange(inputValue);
        }
      }}
    >
      {({ isOpen, inputValue, itemToString, selectedItem, clearSelection, getInputProps, getToggleButtonProps, getItemProps, highlightedIndex }) => {
        const toggleButtonProps = getToggleButtonProps();
        return (
          <div className="pf-c-select">
            <div
              ref={selectToggleRef}
              disabled={isDisabled}
              className={`pf-c-select__toggle${isDisabled ? ' pf-m-disabled' : ''}`}
              {...toggleButtonProps}
            >
              <div className="pf-c-select_toggle-wrapper ddorg__pf4-component-mapper__select-toggle-wrapper">
                <ValueContainer placeholder={placeholder} value={itemToString(selectedItem, isMulti, showMore, handleShowMore, handleChange)} />
              </div>
              {isClearable && parsedValue && <ClearIndicator clearSelection={clearSelection} />}
              <span className="pf-c-select__toggle-arrow">
                {isFetching ? <CircleNotchIcon className="ddorg__pf4-component-mapper__select-loading-icon" /> : <CaretDownIcon />}
              </span>
            </div>
            {isOpen && (
              <Menu
                noResultsMessage={noResultsMessage}
                noOptionsMessage={noOptionsMessage}
                isFetching={isFetching}
                inputRef={inputRef}
                isDisabled={isDisabled}
                placeholder={placeholder}
                isSearchable={isSearchable}
                getInputProps={getInputProps}
                filterOptions={filterOptions}
                filterValue={inputValue}
                options={options}
                getItemProps={getItemProps}
                highlightedIndex={highlightedIndex}
                selectedItem={isMulti ? value : parsedValue}
                isMulti={isMulti}
                menuPortalTarget={menuPortalTarget}
                menuIsPortal={menuIsPortal}
                selectToggleRef={selectToggleRef}
              />
            )}
          </div>
        );
      }}
    </Downshift>
  );
};

InternalSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any,
      label: PropTypes.any
    })
  ).isRequired,
  value: PropTypes.any,
  simpleValue: PropTypes.bool,
  placeholder: PropTypes.string,
  isSearchable: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool,
  isClearable: PropTypes.bool,
  noResultsMessage: PropTypes.node,
  noOptionsMessage: PropTypes.func,
  isMulti: PropTypes.bool,
  isFetching: PropTypes.bool,
  onInputChange: PropTypes.func,
  loadingMessage: PropTypes.node,
  menuPortalTarget: PropTypes.any,
  menuIsPortal: PropTypes.bool
};

const Select = ({ menuIsPortal, ...props }) => {
  const menuPortalTarget = menuIsPortal ? document.body : undefined;

  return <DataDrivenSelect SelectComponent={InternalSelect} menuPortalTarget={menuPortalTarget} menuIsPortal={menuIsPortal} {...props} />;
};

Select.propTypes = {
  isSearchable: PropTypes.bool,
  showMoreLabel: PropTypes.node,
  showLessLabel: PropTypes.node,
  simpleValue: PropTypes.bool,
  value: PropTypes.any,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any,
      label: PropTypes.any
    })
  ),
  onChange: PropTypes.func.isRequired,
  isMulti: PropTypes.bool,
  loadOptions: PropTypes.func,
  loadingMessage: PropTypes.node,
  updatingMessage: PropTypes.node,
  menuIsPortal: PropTypes.bool,
  placeholder: PropTypes.string,
  noResultsMessage: PropTypes.node,
  noOptionsMessage: PropTypes.node
};

Select.defaultProps = {
  showMoreLabel: 'more',
  showLessLabel: 'Show less',
  simpleValue: true,
  loadingMessage: 'Loading...',
  updatingMessage: 'Loading data...',
  options: [],
  menuIsPortal: false,
  placeholder: 'Choose...',
  isSearchable: false,
  isClearable: false,
  noResultsMessage: 'No results found',
  noOptionsMessage: 'No options'
};

export default Select;
