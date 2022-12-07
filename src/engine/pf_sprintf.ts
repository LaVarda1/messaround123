// Source taken and modified from https://github.com/alexei/sprintf.js

import * as pr from './pr'

const getFloatArg = (argNum) =>  
  argNum > 0 && argNum < pr.state.argc ? pr.state.globals_float[4 + (3* argNum)] : 0

const getIntArg = (argNum) =>  
  argNum > 0 && argNum < pr.state.argc ? pr.state.globals_int[4 + (3 * argNum)] : 0

const getStringArg = (argNum) =>  
  argNum > 0 && argNum < pr.state.argc ? pr.getString(pr.state.globals_int[4 + (3 * argNum)]) : ''

const re = {
  not_string: /[^s]/,
  not_bool: /[^t]/,
  not_type: /[^T]/,
  not_primitive: /[^v]/,
  number: /[diefg]/,
  numeric_arg: /[bcdiefguxX]/,
  text: /^[^\x25]+/,
  modulo: /^\x25{2}/,
  placeholder: /^\x25(?:([1-9]\d*)\$|\(([^)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
  key: /^([a-z_][a-z_\d]*)/i,
  key_access: /^\.([a-z_][a-z_\d]*)/i,
  index_access: /^\[(\d+)\]/,
  sign: /^[+-]/
}

export function sprintf_format(parse_tree) {
  var cursor = 1, tree_length = parse_tree.length, 
    output = '', i, k, ph, pad, 
    pad_character, pad_length, is_positive, sign

  let arg = ''

  for (i = 0; i < tree_length; i++) {
    let argNum = 0
    if (typeof parse_tree[i] === 'string') {
        output += parse_tree[i]
    }
    else if (typeof parse_tree[i] === 'object') {
      
      ph = parse_tree[i] // convenience purposes only
      // if (ph.keys) { // keyword argument
      //     arg = argv[cursor]
      //     for (k = 0; k < ph.keys.length; k++) {
      //         if (arg == undefined) {
      //             throw new Error(`[sprintf] Cannot access property "${ph.keys[k]}" of undefined value "${ph.keys[k-1]}"`)
      //         }
      //         arg = arg[ph.keys[k]]
      //     }
      // }
      if (ph.param_no) { // positional argument (explicit)
        argNum = ph.param_no
      }
      else { // positional argument (implicit)
        argNum = cursor++
      }
      
      // if (re.numeric_arg.test(ph.type) && (typeof arg !== 'number' && isNaN(arg))) {
      //   throw new TypeError(`[sprintf] expecting number but found %${arg}`)
      // }

      // if (re.number.test(ph.type)) {
      //   is_positive = arg >= 0
      // }

      switch (ph.type) {
        case 'b':
          arg = parseInt(getFloatArg(argNum), 10).toString(2)
          break
        case 'c':
          arg = String.fromCharCode(parseInt(getFloatArg(argNum), 10))
          break
        case 'd':
        case 'i':
          arg = parseInt(getFloatArg(argNum), 10).toString(10)
          break
        case 'e':
          arg = ph.precision 
            ? parseFloat(getFloatArg(argNum)).toExponential(ph.precision) 
            : parseFloat(getFloatArg(argNum)).toExponential()
          break
        case 'f':
          arg = ph.precision 
            ? parseFloat(getFloatArg(argNum)).toFixed(ph.precision) 
            : parseFloat(getFloatArg(argNum)).toString(10)
          break
        case 'g':
          arg = ph.precision 
            ? String(Number(getFloatArg(argNum).toPrecision(ph.precision))) 
            : parseFloat(getFloatArg(argNum)).toString(10)
          break
        case 'o':
          arg = (parseInt(getFloatArg(argNum), 10) >>> 0).toString(8)
          break
        case 's':
          arg = getStringArg(argNum)
          arg = (ph.precision ? arg.substring(0, ph.precision) : arg)
          break
        case 't':
          arg = getStringArg(argNum)
          arg = String(!!arg)
          arg = (ph.precision ? arg.substring(0, ph.precision) : arg)
          break
        case 'u':
          arg = (parseInt(getFloatArg(argNum), 10) >>> 0).toString(10)
          break
        case 'x':
          arg = (parseInt(getFloatArg(argNum), 10) >>> 0).toString(16)
          break
        case 'X':
          arg = (parseInt(getFloatArg(argNum), 10) >>> 0).toString(16).toUpperCase()
          break
      }
      if (re.number.test(ph.type) && (!is_positive || ph.sign)) {
        sign = is_positive ? '+' : '-'
        arg = arg.toString().replace(re.sign, '')
      }
      else {
        sign = ''
      }
      pad_character = ph.pad_char ? ph.pad_char === '0' ? '0' : ph.pad_char.charAt(1) : ' '
      pad_length = ph.width - (sign + arg).length
      pad = ph.width ? (pad_length > 0 ? pad_character.repeat(pad_length) : '') : ''
      output += ph.align ? sign + arg + pad : (pad_character === '0' ? sign + pad + arg : pad + sign + arg)
    
    }
  }
  return output
}

var sprintf_cache = {}

export function sprintf_parse(fmt) {
  if (sprintf_cache[fmt]) {
      return sprintf_cache[fmt]
  }

  var _fmt = fmt, match, parse_tree: string[] = [], arg_names = 0
  while (_fmt) {
      if ((match = re.text.exec(_fmt)) !== null) {
          parse_tree.push(match[0])
      }
      else if ((match = re.modulo.exec(_fmt)) !== null) {
          parse_tree.push('%')
      }
      else if ((match = re.placeholder.exec(_fmt)) !== null) {
          if (match[2]) {
              arg_names |= 1
              var field_list: string[] = [], replacement_field = match[2]
              let field_match: RegExpExecArray | null = null
              if ((field_match = re.key.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1])
                  while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                      if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                          field_list.push(field_match[1])
                      }
                      else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                          field_list.push(field_match[1])
                      }
                      else {
                          throw new SyntaxError('[sprintf] failed to parse named argument key')
                      }
                  }
              }
              else {
                  throw new SyntaxError('[sprintf] failed to parse named argument key')
              }
              match[2] = field_list
          }
          else {
              arg_names |= 2
          }
          if (arg_names === 3) {
              throw new Error('[sprintf] mixing positional and named placeholders is not (yet) supported')
          }

          parse_tree.push(
              {
                  placeholder: match[0],
                  param_no:    match[1],
                  keys:        match[2],
                  sign:        match[3],
                  pad_char:    match[4],
                  align:       match[5],
                  width:       match[6],
                  precision:   match[7],
                  type:        match[8]
              } as any
          )
      }
      else {
          throw new SyntaxError('[sprintf] unexpected placeholder')
      }
      _fmt = _fmt.substring(match[0].length)
  }
  return sprintf_cache[fmt] = parse_tree
}
