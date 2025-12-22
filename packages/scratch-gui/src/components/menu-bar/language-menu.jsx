import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';
import locales from 'scratch-l10n';

import check from './check.svg';
import {MenuItem, Submenu} from '../menu/menu.jsx';
import languageIcon from '../language-selector/language-icon.svg';
import {closeLanguageMenu, languageMenuOpen, openLanguageMenu} from '../../reducers/menus.js';
import {selectLocale} from '../../reducers/locales.js';
import {MenuRefContext} from '../context-menu/menu-path-context.jsx';

import styles from './settings-menu.css';

import dropdownCaret from './dropdown-caret.svg';
import {BaseMenu} from './base-menu';

class LanguageMenu extends BaseMenu {
    constructor (props) {
        super(props);
        bindAll(this, [
            'onSelectItem',
            'setRef',
            'handleMouseOver'
        ]);

        this.itemRefs = Object.keys(locales).map(() => React.createRef());
    }

    componentDidUpdate (prevProps) {
        // If the submenu has been toggled open, try scrolling the selected option into view.
        if (!prevProps.menuOpen && this.props.menuOpen && this.selectedRef) {
            this.selectedRef.scrollIntoView({block: 'center'});
        }
    }

    static contextType = MenuRefContext;

    setRef (component) {
        this.selectedRef = component;
    }

    onSelectItem () {
        this.props.onChangeLanguage(Object.keys(locales)[this.state.focusedIndex]);
        this.context.clear();
    }

    handleMouseOver () {
        // If we are using hover rather than clicks for submenus, scroll the selected option into view
        if (!this.props.menuOpen && this.selectedRef) {
            this.selectedRef.scrollIntoView({block: 'center'});
            this.setFocusedRef(this.selectedRef);
        }
    }

    render () {
        const {
            currentLocale,
            focusedRef,
            isRtl,
            onChangeLanguage
        } = this.props;

        return (
            <MenuItem expanded={this.context.isOpenMenu(focusedRef)}>
                <div
                    className={styles.option}
                    onClick={this.handleOnOpen}
                    onMouseOver={this.handleMouseOver}
                    ref={focusedRef}
                    aria-label="Language Menu"
                    role="button"
                    tabIndex={-1}
                    onKeyDown={this.handleKeyPress}
                >
                    <img
                        className={styles.icon}
                        src={languageIcon}
                    />
                    <span className={styles.submenuLabel}>
                        <FormattedMessage
                            defaultMessage="Language"
                            description="Language sub-menu"
                            id="gui.menuBar.language"
                        />
                    </span>
                    <img
                        className={styles.expandCaret}
                        src={dropdownCaret}
                    />
                </div>
                <Submenu
                    className={styles.languageSubmenu}
                    place={isRtl ? 'left' : 'right'}
                >
                    {
                        Object.keys(locales)
                            .map((locale, index) => {
                                const isSelected = currentLocale === locale;

                                return (<MenuItem
                                    key={locale}
                                    className={styles.languageMenuItem}
                                    // eslint-disable-next-line react/jsx-no-bind
                                    onClick={() => onChangeLanguage(locale)}
                                    focusedRef={this.itemRefs[index]}
                                    onParentKeyPress={this.handleKeyPress}
                                >
                                    <img
                                        className={classNames(styles.check, {
                                            [styles.selected]: isSelected
                                        })}
                                        src={check}
                                        {...(isSelected && {ref: this.setRef})}
                                    />
                                    {locales[locale].name}
                                </MenuItem>);
                            })
                    }
                </Submenu>
            </MenuItem>
        );
    }
}

LanguageMenu.propTypes = {
    currentLocale: PropTypes.string,
    focusedRef: PropTypes.shape({current: PropTypes.instanceOf(Element)}),
    isRtl: PropTypes.bool,
    menuOpen: PropTypes.bool,
    onChangeLanguage: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func
};

const mapStateToProps = state => ({
    currentLocale: state.locales.locale,
    isRtl: state.locales.isRtl,
    menuOpen: languageMenuOpen(state),
    messagesByLocale: state.locales.messagesByLocale
});

const mapDispatchToProps = dispatch => ({
    onChangeLanguage: locale => {
        dispatch(selectLocale(locale));
    },
    onOpen: () => dispatch(openLanguageMenu()),
    onClose: () => dispatch(closeLanguageMenu())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LanguageMenu);
