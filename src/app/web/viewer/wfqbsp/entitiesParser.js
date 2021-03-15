"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETYPE = {
    ev_void: 0,
    ev_string: 1,
    ev_float: 2,
    ev_vector: 3,
    ev_entity: 4,
    ev_field: 5,
    ev_function: 6,
    ev_pointer: 7
};
// This whole think is whack. Wrapping in closure.
exports.parseEntities = (entitiesStr) => {
    var token = '';
    const parse = function (data) {
        token = '';
        var i = 0, c;
        if (data.length === 0)
            return;
        var skipwhite = true;
        for (;;) {
            if (skipwhite !== true)
                break;
            skipwhite = false;
            for (;;) {
                if (i >= data.length)
                    return;
                c = data.charCodeAt(i);
                if (c > 32)
                    break;
                ++i;
            }
            if ((c === 47) && (data.charCodeAt(i + 1) == 47)) {
                for (;;) {
                    if ((i >= data.length) || (data.charCodeAt(i) === 10))
                        break;
                    ++i;
                }
                skipwhite = true;
            }
        }
        if (c === 34) {
            ++i;
            for (;;) {
                c = data.charCodeAt(i);
                ++i;
                if ((i >= data.length) || (c === 34))
                    return data.substring(i);
                token += String.fromCharCode(c);
            }
        }
        for (;;) {
            if ((i >= data.length) || (c <= 32))
                break;
            token += String.fromCharCode(c);
            ++i;
            c = data.charCodeAt(i);
        }
        return data.substring(i);
    };
    // seems to only update pr.state.strings
    // const newString = function(string)
    // {
    //   var newstring = [], i, c;
    //   for (i = 0; i < string.length; ++i)
    //   {
    //     c = string.charCodeAt(i);
    //     if ((c === 92) && (i < (string.length - 1)))
    //     {
    //       ++i;
    //       newstring[newstring.length] = (string.charCodeAt(i) === 110) ? '\n' : '\\';
    //     }
    //     else
    //       newstring[newstring.length] = String.fromCharCode(c);
    //   }
    //   return pr.newString(newstring.join(''), string.length + 1);
    // };
    const parseEpair = (ent, key, s) => {
        switch (key) {
            case 'origin':
            case 'angles':
                ent[key] = s.split(' ').map(st => parseFloat(st));
                break;
            default:
                ent[key] = s;
                break;
        }
        // switch (key.type & 0x7fff)
        // {
        // case ETYPE.ev_string:
        //   d_int[key.ofs] = newString(s);
        //   return true;
        // case ETYPE.ev_float:
        //   d_float[key.ofs] = q.atof(s);
        //   return true;
        // case ETYPE.ev_vector:
        //   v = s.split(' ');
        //   d_float[key.ofs] = q.atof(v[0]);
        //   d_float[key.ofs + 1] = q.atof(v[1]);
        //   d_float[key.ofs + 2] = q.atof(v[2]);
        //   return true;
        // case ETYPE.ev_entity:
        //   d_int[key.ofs] = q.atoi(s);
        //   return true;
        // case ETYPE.ev_field:
        //   d = findField(s);
        //   if (d == null)
        //   {
        //     con.print('Can\'t find field ' + s + '\n');
        //     return;
        //   }
        //   d_int[key.ofs] = d.ofs;
        //   return true;
        // case pr.ETYPE.ev_function:
        //   d = findFunction(s);
        //   if (d == null)
        //   {
        //     con.print('Can\'t find function ' + s + '\n');
        //     return;
        //   }
        //   d_int[key.ofs] = d;
        // }
        return true;
    };
    const parseEdict = function (data, ent) {
        var i, init, anglehack, keyname, n, key;
        for (;;) {
            data = parse(data);
            if (token.charCodeAt(0) === 125)
                break;
            if (data == null)
                throw new Error('parseEdict: EOF without closing brace');
            if (token === 'angle') {
                token = 'angles';
                anglehack = true;
            }
            else {
                anglehack = false;
                if (token === 'light')
                    token = 'light_lev';
            }
            for (n = token.length; n > 0; --n) {
                if (token.charCodeAt(n - 1) !== 32)
                    break;
            }
            keyname = token.substring(0, n);
            data = parse(data);
            if (data == null)
                throw new Error('parseEdict: EOF without closing brace');
            if (token.charCodeAt(0) === 125)
                throw new Error('parseEdict: closing brace without data');
            init = true;
            if (keyname.charCodeAt(0) === 95)
                continue;
            if (anglehack == true)
                token = '0 ' + token + ' 0';
            if (parseEpair(ent, keyname, token) !== true)
                throw new Error('parseEdict: parse error');
        }
        if (init !== true)
            ent.free = true;
        return data;
    };
    const loadEntities = (entitiesStr) => {
        const ents = [];
        var data = entitiesStr;
        for (;;) {
            data = parse(data);
            if (data == null)
                break;
            if (token.charCodeAt(0) !== 123)
                throw new Error('ED.LoadFromFile: found ' + token + ' when expecting {');
            var ent = {};
            data = parseEdict(data, ent);
            ents.push(ent);
        }
        return ents;
    };
    return loadEntities(entitiesStr);
};
//# sourceMappingURL=entitiesParser.js.map