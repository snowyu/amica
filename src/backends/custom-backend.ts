import type { JSONSchemaType } from 'ajv';
import { addFactoryAbility, CustomFactory, isString } from 'custom-factory';
import { PropDescriptors, Properties, PropertyAbility } from 'property-manager';
import type { RJSFSchema } from '@rjsf/utils';
import type { ICustomFactoryOptions } from 'custom-factory';

const CUstomBackendSchema = {
  name: {
    type: 'string',
    required: true,
    get() {
      let result = (this as any).$name
      if (!result) {
        const ctor = (this as any).constructor
        result = CustomBackend.formatNameFromClass(ctor)
      }
      return result;
    },
    set(value: string) {
      if (value) {(this as any).$name = value}
    },
    description: 'the unique name of the backend',
  },
  enabled: {
    type: 'boolean',
    // the default value is true
    value: true,
    description: 'enable the backend or not',
  },
  icon: {
    type: 'string',
    description: 'the icon name of the backend',
  },
  displayName: {
    type: 'string',
    description: 'the backend display name',
  },
  alias: {
    type: ['string', 'array'],
    items: {
      type: 'string',
    },
    description: 'the another unique name of the backend',
  },
  description: {
    type: 'string',
    description: 'the optional description of the backend',
  }
}


export interface CustomBackendProps {
  name: string,
  /**
   * the backend whether is enabled, defaults to true
   */
  enabled: boolean,
  icon?: boolean,
  displayName?: string,
  alias?: string|string[],
  description?: string,
  [k: string]: any,
}

type BackendClassForEachFn = (ctor: typeof CustomBackend, name: string) => 'brk' | string | undefined;

export declare namespace CustomBackend {
  let isDir: boolean;
  // ------ properties and methods injected via custom-factory
  let _children: {[name: string]:any|typeof CustomBackend};
  /**
   * format(transform) the name to be registered for the aClass
   * @param {*} aClass
   * @param {number} [aBaseNameOnly]
   * @returns {string} the name to register
   */
  function formatNameFromClass(aClass: Function, aBaseNameOnly?: number): string;
  /**
   * register the aClass to the factory
   * @internal
   * @param {Function} aClass the class to register the Factory
   * @param {ICustomFactoryOptions|any} [aOptions] the options for the class and the factory
   * @returns {boolean} return true if successful.
   */
  function _register(aClass: Function, aOptions?: (ICustomFactoryOptions | any) | undefined): boolean;
  function _registerWithParent(aClass: typeof CustomBackend, aParentClass: typeof CustomBackend, aOptions?: ICustomFactoryOptions): boolean;
  /**
   * Check the name, alias or itself whether registered.
   * @param name the registered item name or alias
   * @returns the registered class if registered, otherwise returns false
   */
  function registeredClass(name: string|undefined): false|typeof CustomBackend;
  /**
   * find the real root factory
   *
   * @internal
   */
  function _findRootFactory(aClass: typeof CustomBackend): typeof CustomBackend|undefined;
  /**
   * executes a provided callback function once for each registered element.
   * @param {BackendClassForEachFn} cb the forEach callback function
   * @returns {this}
   */
  function forEach(cb: BackendClassForEachFn): typeof CustomBackend;
  /**
   * unregister this class in the factory
   * @param {string|Function|undefined} aName the registered name or class, no name means unregister itself.
   * @returns {boolean} true means successful
   */
  function unregister(aName: string|Function|undefined): boolean;

  // ------ properties and methods injected via property-manager
  /**
   *  Define the attributes of the target class.
   * @param aTarget the target class to define attributes
   * @param {PropDescriptors} aProperties the attribute descriptors
   * @param {boolean} [recreate] Whether recreating the $attributes
   */
  function defineProperties(aTarget: Function, aProperties: PropDescriptors, recreate?:boolean): Properties;
  /**
   * Get the attribute descriptors of the class
   */
  function getProperties(): any;
  function toJSON(): CustomBackendProps;
}

export declare interface CustomBackend extends CustomBackendProps {
  initialize(args?: any): void;
}

export class CustomBackend {
  static schema: RJSFSchema;
  // static ROOT_NAME = 'Backend';
  static enabled = true;
  static _baseNameOnly = 1;
  // overwrite it to specify the root factory class
  static findRootFactory() {
    return this._findRootFactory(CustomBackend);
  }

  /**
   * registered items
   */
  static get items() {
    return this._children as {[key: string]: typeof CustomBackend}
  }

  /**
   * register the aClass as sub-factory item to the factory
   * @param aBackend the class to register the Factory
   * @param {ICustomFactoryOptions|any} [aOptions] the options for the class and the factory
   * @returns {boolean} return true if successful.
   */
  static registerBackend(aBackend: typeof CustomBackend, aOptions?: ICustomFactoryOptions|any) {
    if (!aOptions) {aOptions = {}}
    aOptions.isFactory = true;
    aBackend.isDir = true;
    const result = this._registerWithParent(aBackend, this, aOptions);
    if (result && !aBackend.hasOwnProperty('_children')) {aBackend._children = {}};
    return result;
  }

  /**
   * register the aClass as product item to the factory
   * @param {Function} aBackend the class to register the Factory
   * @param {ICustomFactoryOptions|any} [aOptions] the options for the class and the factory
   * @returns {boolean} return true if successful.
   */
  static register(aBackend: Function, aOptions?: ICustomFactoryOptions|any) {
    if (!aOptions) {aOptions = {}}
    aOptions.isFactory = false;
    if ((aBackend as any).isDir === true){
      (aBackend as any).isDir = false;
    }
    return this._register(aBackend, aOptions);
  }

  declare private $name: string|undefined;

  constructor(args?: any, BackendType?: string|typeof CustomBackend|false) {
    if (typeof BackendType === 'string') {
      BackendType = CustomBackend.registeredClass(BackendType);
    }
    if (this.constructor === CustomBackend) {
      if (!BackendType) throw new TypeError('can not determine the backend type.')
      if (BackendType !== CustomBackend) return new BackendType(args)
    }
    this.initialize(args);
    if (this.enabled === undefined) {
      this.enabled = true;
    }
    // this.name
  }
}

CustomBackend.prototype.name = 'Backend';

addFactoryAbility(CustomBackend, {exclude: ['@register']})
PropertyAbility(CustomBackend)

CustomBackend.defineProperties(CustomBackend, CUstomBackendSchema)