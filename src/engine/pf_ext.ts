const makevectors = 
const ebfs_builtins [] =
	{ defaultFnNbr: 0, name: null, fn: Fixme, fnNbr: 0 },				// has to be first entry as it is needed for initialization in PR_LoadProgs()
	{ defaultFnNbr: 1, name: "makevectors", fn: makevectors, fnNbr: 0 },	// void(entity e)	makevectors 		= #1;
	{ defaultFnNbr: 2, name: "setorigin", fn: setorigin, fnNbr: 0 },		// void(entity e, vector o) setorigin	= #2;
	{ defaultFnNbr: 3, name: "setmodel", fn: setmodel, fnNbr: 0 },		// void(entity e, string m) setmodel	= #3;
	{ defaultFnNbr: 4, name: "setsize", fn: setsize, fnNbr: 0 },			// void(entity e, vector min, vector max) setsize = #4;
//	{ defaultFnNbr: 5, name: "fixme", fn: Fixme, fnNbr: 0 },				// void(entity e, vector min, vector max) setabssize = #5;
	{ defaultFnNbr: 6, name: "break", fn: break, fnNbr: 0 },				// void() break						= #6;
	{ defaultFnNbr: 7, name: "random", fn: random, fnNbr: 0 },			// float() random						= #7;
	{ defaultFnNbr: 8, name: "sound", fn: sound, fnNbr: 0 },				// void(entity e, float chan, string samp) sound = #8;
	{ defaultFnNbr: 9, name: "normalize", fn: normalize, fnNbr: 0 },		// vector(vector v) normalize			= #9;
	{ defaultFnNbr: 10, name: "error", fn: error, fnNbr: 0 },				// void(string e) error				= #10;
	{ defaultFnNbr: 11, name: "objerror", fn: objerror, fnNbr: 0 },		// void(string e) objerror				= #11;
	{ defaultFnNbr: 12, name: "vlen", fn: vlen, fnNbr: 0 },				// float(vector v) vlen				= #12;
	{ defaultFnNbr: 13, name: "vectoyaw", fn: vectoyaw, fnNbr: 0 },		// float(vector v) vectoyaw		= #13;
	{ defaultFnNbr: 14, name: "spawn", fn: Spawn, fnNbr: 0 },				// entity() spawn						= #14;
	{ defaultFnNbr: 15, name: "remove", fn: Remove, fnNbr: 0 },			// void(entity e) remove				= #15;
	{ defaultFnNbr: 16, name: "traceline", fn: traceline, fnNbr: 0 },		// float(vector v1, vector v2, float tryents) traceline = #16;
	{ defaultFnNbr: 17, name: "checkclient", fn: checkclient, fnNbr: 0 },	// entity() clientlist					= #17;
	{ defaultFnNbr: 18, name: "find", fn: Find, fnNbr: 0 },				// entity(entity start, .string fld, string match) find = #18;
	{ defaultFnNbr: 19, name: "precache_sound", fn: precache_sound, fnNbr: 0 },	// void(string s) precache_sound		= #19;
	{ defaultFnNbr: 20, name: "precache_model", fn: precache_model, fnNbr: 0 },	// void(string s) precache_model		= #20;
	{ defaultFnNbr: 21, name: "stuffcmd", fn: stuffcmd, fnNbr: 0 },		// void(entity client, string s)stuffcmd = #21;
	{ defaultFnNbr: 22, name: "findradius", fn: findradius, fnNbr: 0 },	// entity(vector org, float rad) findradius = #22;
	{ defaultFnNbr: 23, name: "bprint", fn: bprint, fnNbr: 0 },			// void(string s) bprint				= #23;
	{ defaultFnNbr: 24, name: "sprint", fn: sprint, fnNbr: 0 },			// void(entity client, string s) sprint = #24;
	{ defaultFnNbr: 25, name: "dprint", fn: dprint, fnNbr: 0 },			// void(string s) dprint				= #25;
	{ defaultFnNbr: 26, name: "ftos", fn: ftos, fnNbr: 0 },				// void(string s) ftos				= #26;
	{ defaultFnNbr: 27, name: "vtos", fn: vtos, fnNbr: 0 },				// void(string s) vtos				= #27;
	{ defaultFnNbr: 28, name: "coredump", fn: coredump, fnNbr: 0 },
	{ defaultFnNbr: 29, name: "traceon", fn: traceon, fnNbr: 0 },
	{ defaultFnNbr: 30, name: "traceoff", fn: traceoff, fnNbr: 0 },
	{ defaultFnNbr: 31, name: "eprint", fn: eprint, fnNbr: 0 },			// void(entity e) debug print an entire entity
	{ defaultFnNbr: 32, name: "walkmove", fn: walkmove, fnNbr: 0 },		// float(float yaw, float dist) walkmove
//	{ defaultFnNbr: 33, name: "fixme", fn: Fixme, fnNbr: 0 },				// float(float yaw, float dist) walkmove
	{ defaultFnNbr: 34, name: "droptofloor", fn: droptofloor, fnNbr: 0 },
	{ defaultFnNbr: 35, name: "lightstyle", fn: lightstyle, fnNbr: 0 },
	{ defaultFnNbr: 36, name: "rint", fn: rint, fnNbr: 0 },
	{ defaultFnNbr: 37, name: "floor", fn: floor, fnNbr: 0 },
	{ defaultFnNbr: 38, name: "ceil", fn: ceil, fnNbr: 0 },
//	{ defaultFnNbr: 39, name: "fixme", fn: Fixme, fnNbr: 0 },
	{ defaultFnNbr: 40, name: "checkbottom", fn: checkbottom, fnNbr: 0 },
	{ defaultFnNbr: 41, name: "pointcontents", fn: pointcontents, fnNbr: 0 },
//	{ defaultFnNbr: 42, name: "fixme", fn: Fixme, fnNbr: 0 },
	{ defaultFnNbr: 43, name: "fabs", fn: fabs, fnNbr: 0 },
	{ defaultFnNbr: 44, name: "aim", fn: aim, fnNbr: 0 },
	{ defaultFnNbr: 45, name: "cvar", fn: cvar, fnNbr: 0 },
	{ defaultFnNbr: 46, name: "localcmd", fn: localcmd, fnNbr: 0 },
	{ defaultFnNbr: 47, name: "nextent", fn: nextent, fnNbr: 0 },
	{ defaultFnNbr: 48, name: "particle", fn: particle, fnNbr: 0 },
	{ defaultFnNbr: 49, name: "ChangeYaw", fn: changeyaw, fnNbr: 0 },
//	{ defaultFnNbr: 50, name: "fixme", fn: Fixme, fnNbr: 0 },
	{ defaultFnNbr: 51, name: "vectoangles", fn: vectoangles, fnNbr: 0 },
	{ defaultFnNbr: 52, name: "WriteByte", fn: WriteByte, fnNbr: 0 },
	{ defaultFnNbr: 53, name: "WriteChar", fn: WriteChar, fnNbr: 0 },
	{ defaultFnNbr: 54, name: "WriteShort", fn: WriteShort, fnNbr: 0 },
	{ defaultFnNbr: 55, name: "WriteLong", fn: WriteLong, fnNbr: 0 },
	{ defaultFnNbr: 56, name: "WriteCoord", fn: WriteCoord, fnNbr: 0 },
	{ defaultFnNbr: 57, name: "WriteAngle", fn: WriteAngle, fnNbr: 0 },
	{ defaultFnNbr: 58, name: "WriteString", fn: WriteString, fnNbr: 0 },
	{ defaultFnNbr: 59, name: "WriteEntity", fn: WriteEntity, fnNbr: 0 },
	{ defaultFnNbr: 60, name: "sin", fn: sin, fnNbr: 0 },
	{ defaultFnNbr: 61, name: "cos", fn: cos, fnNbr: 0 },
	{ defaultFnNbr: 62, name: "sqrt", fn: sqrt, fnNbr: 0 },
	{ defaultFnNbr: 63, name: "changepitch", fn: changepitch, fnNbr: 0 },
	{ defaultFnNbr: 64, name: "TraceToss", fn: TraceToss, fnNbr: 0 },
	{ defaultFnNbr: 65, name: "etos", fn: etos, fnNbr: 0 },
//	{ defaultFnNbr: 66, name: "WaterMove", fn: WaterMove, fnNbr: 0 },
	{ defaultFnNbr: 67, name: "movetogoal", fn: SV_MoveToGoal, fnNbr: 0 },
	{ defaultFnNbr: 68, name: "precache_file", fn: precache_file, fnNbr: 0 },
	{ defaultFnNbr: 69, name: "makestatic", fn: makestatic, fnNbr: 0 },
	{ defaultFnNbr: 70, name: "changelevel", fn: changelevel, fnNbr: 0 },
//	{ defaultFnNbr: 71, name: "fixme", fn: Fixme, fnNbr: 0 },
	{ defaultFnNbr: 72, name: "cvar_set", fn: cvar_set, fnNbr: 0 },
	{ defaultFnNbr: 73, name: "centerprint", fn: centerprint, fnNbr: 0 },
	{ defaultFnNbr: 74, name: "ambientsound", fn: ambientsound, fnNbr: 0 },
	{ defaultFnNbr: 75, name: "precache_model2", fn: precache_model, fnNbr: 0 },
	{ defaultFnNbr: 76, name: "precache_sound2", fn: precache_sound, fnNbr: 0 },	// precache_sound2 is different only for qcc
	{ defaultFnNbr: 77, name: "precache_file2", fn: precache_file, fnNbr: 0 },
	{ defaultFnNbr: 78, name: "setspawnparms", fn: setspawnparms, fnNbr: 0 },
//	{  79, "fixme", FIXME},
//	{  80, "fixme", FIXME},
	{ defaultFnNbr: 81, name: "stof", fn: stof, fnNbr: 0 },	// 2001-09-20 QuakeC string manipulation by FrikaC/Maddes

// 2001-11-15 DarkPlaces general builtin functions by Lord Havoc  start
	{ defaultFnNbr: 90, name: "tracebox", fn: tracebox, fnNbr: 0 },
	{ defaultFnNbr: 91, name: "randomvec", fn: randomvec, fnNbr: 0 },
//	{ defaultFnNbr: 92, name: "getlight", fn: GetLight, fnNbr: 0 },	// not implemented yet
//	{ defaultFnNbr: 93, name: "cvar_create", fn: cvar_create, fnNbr: 0 },		// 2001-09-18 New BuiltIn Function: cvar_create() by Maddes
	{ defaultFnNbr: 94, name: "fmin", fn: fmin, fnNbr: 0 },
	{ defaultFnNbr: 95, name: "fmax", fn: fmax, fnNbr: 0 },
	{ defaultFnNbr: 96, name: "fbound", fn: fbound, fnNbr: 0 },
	{ defaultFnNbr: 97, name: "fpow", fn: fpow, fnNbr: 0 },
	{ defaultFnNbr: 98, name: "findfloat", fn: FindFloat, fnNbr: 0 },
//	{ defaultFnNbr: 99, name: "extension_find", fn: extension_find, fnNbr: 0 },	// 2001-10-20 Extension System by Lord Havoc/Maddes
//	{ defaultFnNbr: 0, name: "checkextension", fn: extension_find, fnNbr: 0 },
	{ defaultFnNbr: 100, name: "builtin_find", fn: builtin_find, fnNbr: 0 },		// 2001-09-14 Enhanced BuiltIn Function System (EBFS) by Maddes
	{ defaultFnNbr: 101, name: "cmd_find", fn: cmd_find, fnNbr: 0 },				// 2001-09-16 New BuiltIn Function: cmd_find() by Maddes
	{ defaultFnNbr: 102, name: "cvar_find", fn: cvar_find, fnNbr: 0 },				// 2001-09-16 New BuiltIn Function: cvar_find() by Maddes
	{ defaultFnNbr: 103, name: "cvar_string", fn: cvar_string, fnNbr: 0 },			// 2001-09-16 New BuiltIn Function: cvar_string() by Maddes
//	{ defaultFnNbr: 105, name: "cvar_free", fn: cvar_free, fnNbr: 0 },				// 2001-09-18 New BuiltIn Function: cvar_free() by Maddes
//	{ defaultFnNbr: 106, name: "NVS_InitSVCMsg", fn: NVS_InitSVCMsg, fnNbr: 0 },	// 2000-05-02 NVS SVC by Maddes
	{ defaultFnNbr: 107, name: "WriteFloat", fn: WriteFloat, fnNbr: 0 },			// 2001-09-16 New BuiltIn Function: WriteFloat() by Maddes
	{ defaultFnNbr: 108, name: "etof", fn: etof, fnNbr: 0 },						// 2001-09-25 New BuiltIn Function: etof() by Maddes
	{ defaultFnNbr: 109, name: "ftoe", fn: ftoe, fnNbr: 0 },						// 2001-09-25 New BuiltIn Function: ftoe() by Maddes
// 2001-09-20 QuakeC file access by FrikaC/Maddes  start
	{ defaultFnNbr: 110, name: "fopen", fn: fopen, fnNbr: 0 },
	{ defaultFnNbr: 111, name: "fclose", fn: fclose, fnNbr: 0 },
	{ defaultFnNbr: 112, name: "fgets", fn: fgets, fnNbr: 0 },
	{ defaultFnNbr: 113, name: "fputs", fn: fputs, fnNbr: 0 },
	{ defaultFnNbr: 0, name: "open", fn: fopen, fnNbr: 0 },						// 0 indicates that this entry is just for remapping (because of name and number change)
	{ defaultFnNbr: 0, name: "close", fn: fclose, fnNbr: 0 },
	{ defaultFnNbr: 0, name: "read", fn: fgets, fnNbr: 0 },
	{ defaultFnNbr: 0, name: "write", fn: fputs, fnNbr: 0 },
// 2001-09-20 QuakeC file access by FrikaC/Maddes  end

// 2001-09-20 QuakeC string manipulation by FrikaC/Maddes  start
	{ defaultFnNbr: 114, name: "strlen", fn: strlen, fnNbr: 0 },
	{ defaultFnNbr: 115, name: "strcat", fn: strcat, fnNbr: 0 },
	{ defaultFnNbr: 116, name: "substring", fn: substring, fnNbr: 0 },
	{ defaultFnNbr: 117, name: "stov", fn: stov, fnNbr: 0 },
	{ defaultFnNbr: 118, name: "strzone", fn: strzone, fnNbr: 0 },
	{ defaultFnNbr: 119, name: "strunzone", fn: strunzone, fnNbr: 0 },
	{ defaultFnNbr: 0, name: "zone", fn: strzone, fnNbr: 0 },		// 0 indicates that this entry is just for remapping (because of name and number change)
	{ defaultFnNbr: 0, name: "unzone", fn: strunzone, fnNbr: 0 },
// 2001-09-20 QuakeC string manipulation by FrikaC/Maddes  end

// 2001-11-15 DarkPlaces general builtin functions by LordHavoc  start
	{ defaultFnNbr: 400, name: "copyentity", fn: copyentity, fnNbr: 0 },
	{ defaultFnNbr: 401, name: "setcolor", fn: setcolor, fnNbr: 0 },
	{ defaultFnNbr: 402, name: "findchain", fn: findchain, fnNbr: 0 },
	{ defaultFnNbr: 403, name: "findchainfloat", fn: findchainfloat, fnNbr: 0}
]