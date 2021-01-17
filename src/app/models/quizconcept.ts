/**
 * Storable object
 */
export interface IStorableObject {
    storeToString(): string;
    restoreFromString(str: string): void;
}

/**
 * Storable object
 */
export abstract class StorableObject implements IStorableObject {
    /**
     * Store to a string
     */
    public storeToString(): string {
        const jobj: any = this.storeToJsonObject();
        return JSON && JSON.stringify(jobj);
    }
    /**
     * Restore to a string
     * @param str String to prase
     */
    public restoreFromString(str: string): void {
        const jobj = JSON.parse(str);
        this.restoreFromJsonObject(jobj);

        if (this.canCalcResult()) {
            this.calcResult();
        }
    }

    protected storeToJsonObject(): any {
        return {};
    }
    protected restoreFromJsonObject(data: any): void {
        // Do nothing
    }

    protected canCalcResult(): boolean {
        return true; // Default is true
    }
    protected calcResult(): void {
        // Do nothing
    }
}

/**
 * Quiz item
 */
export abstract class QuizItem extends StorableObject {
    private _index: number;
    get QuizIndex(): number {
        return this._index;
    }
    set QuizIndex(idx: number) {
        this._index = idx;
    }

    constructor() {
        super();
        this._index = 0;
    }

    public IsCorrect(): boolean {
        if (!this.canCalcResult()) {
            return false;
        }

        return true;
    }

    public getQuizFormat(): string {
        return '';
    }

    protected storeToJsonObject(): any {
        return super.storeToJsonObject();
    }
    protected restoreFromJsonObject(data: any): void {
        super.restoreFromJsonObject(data);
    }

    protected canCalcResult(): boolean {
        return true; // Default is true
    }
    protected calcResult(): void {
        // Do nothing
    }
}

/**
 * Math quiz item for Primary School
 */
export class PrimarySchoolMathQuizItem extends QuizItem {
    public IsCorrect(): boolean {
        if (!super.IsCorrect()) {
            return false;
        }
        return true;
    }

    public getQuizFormat(): string {
        const rststr = super.getQuizFormat();
        return rststr;
    }

    public getCorrectFormula(): string {
        return '';
    }

    public getInputtedForumla(): string {
        return '';
    }

    protected storeToJsonObject(): any {
        return super.storeToJsonObject();
    }

    protected restoreFromJsonObject(data: any): void {
        super.restoreFromJsonObject(data);
    }

    protected canCalcResult(): boolean {
        if (!super.canCalcResult()) {
            return false;
        }
        return true;
    }
    protected calcResult(): void {
        // Do nothing
    }
}

/**
 * Quiz item for FAO
 * four arithmetic operations
 */
export class PrimarySchoolMathFAOQuizItem extends PrimarySchoolMathQuizItem {
    protected _leftNumber: number = 0;
    protected _rightNumber: number = 0;
    protected _decimalPlaces: number;

    get LeftNumber(): number {
        return this._leftNumber;
    }
    get RightNumber(): number {
        return this._rightNumber;
    }
    get decimalPlaces(): number {
        return this._decimalPlaces;
    }

    constructor(lft?: number, right?: number, dplace?: number) {
        super();

        if (dplace) {
            this._decimalPlaces = dplace;
        } else {
            this._decimalPlaces = 0; // By default, it is 0
        }

        if (lft) {
            if (this._decimalPlaces > 0) {
                this._leftNumber = parseFloat(lft.toFixed(this._decimalPlaces));
            } else {
                this._leftNumber = Math.round(lft);
            }
        }
        if (right) {
            if (this._decimalPlaces > 0) {
                this._rightNumber = parseFloat(right.toFixed(this._decimalPlaces));
            } else {
                this._rightNumber = Math.round(right);
            }
        }

        if (this.canCalcResult()) {
            this.calcResult();
        }
    }

    public IsCorrect(): boolean {
        if (!super.IsCorrect()) {
            return false;
        }
        return true;
    }

    public getQuizFormat(): string {
        const rststr = super.getQuizFormat();
        return rststr;
    }

    public getCorrectFormula(): string {
        const rststr = super.getCorrectFormula();
        return rststr;
    }

    public getInputtedForumla(): string {
        const rststr = super.getInputtedForumla();
        return rststr;
    }

    protected storeToJsonObject(): any {
        const jobj = super.storeToJsonObject();
        jobj.leftNumber = this._leftNumber;
        jobj.rightNumber = this._rightNumber;
        jobj.decimalPlaces = this.decimalPlaces;
        return jobj;
    }
    protected restoreFromJsonObject(jobj: any): void {
        if (jobj && jobj.leftNumber) {
            this._leftNumber = +jobj.leftNumber;
        }
        if (jobj && jobj.rightNumber) {
            this._rightNumber = +jobj.rightNumber;
        }
        if (jobj && jobj.decimalPlaces) {
            this._decimalPlaces = +jobj.decimalPlaces;
        } else {
            this._decimalPlaces = 0;
        }
    }
    protected canCalcResult(): boolean {
        if (!super.canCalcResult()) {
            return false;
        }
        if (this._leftNumber === undefined || this._rightNumber === undefined) {
            return false;
        }

        return true;
    }
    protected calcResult(): void {
        super.calcResult();
    }
}

/**
 * Quiz section
 */
export class PrimarySchoolMathQuizSection {
    private _sectionNumber: number;
    get SectionNumber(): number {
        return this._sectionNumber;
    }

    private _itemCount: number = 0;
    get ItemsCount(): number {
        return this._itemCount;
    }
    set ItemsCount(ic: number) {
        this._itemCount = ic;
    }

    private _itemFailed: number = 0;
    get ItemsFailed(): number {
        return this._itemFailed;
    }
    set ItemsFailed(ifed: number) {
        this._itemFailed = ifed;
    }

    private _startPoint: number = 0;
    private _timeSpent: number = 0;
    get TimeSpent(): number {
        return this._timeSpent;
    }

    constructor(scn: number, ic: number) {
        this._sectionNumber = scn;

        this.ItemsCount = ic;
    }

    public SectionStart() {
        this._startPoint = new Date().getTime();
    }
    public SectionComplete() {
        const stoppnt = new Date().getTime();
        this._timeSpent = Math.round((stoppnt - this._startPoint) / 1000);
    }

    public getSummaryInfo(): string {
        let rst: string = 'BATCH#' + this.SectionNumber.toString() + ';';
        rst = rst + ' total items: ' + this.ItemsCount.toString() + '; '
            + (this.ItemsFailed > 0 ? ' Failed : ' + this.ItemsFailed.toString() : '');
        rst = rst += ' Time spent: ' + this.TimeSpent.toString() + ' s';
        return rst;
    }
}

/**
 * Math quiz item for additon part
 */
export class AdditionQuizItem extends PrimarySchoolMathFAOQuizItem {
    private _result!: number;
    private _inputtedResult!: number;

    get Result(): number {
        return this._result;
    }
    get InputtedResult(): number {
        return this._inputtedResult;
    }
    set InputtedResult(ir: number) {
        this._inputtedResult = ir;
    }

    public IsCorrect(): boolean {
        if (!super.IsCorrect()) {
            return false;
        }

        if (this._inputtedResult === null || this._inputtedResult === undefined) {
            return false;
        }

        if (this._inputtedResult === this._result) {
            return true;
        }

        return false;
    }

    constructor(lft?: number, right?: number, dplace?: number) {
        super(lft, right, dplace);
    }

    public getCorrectFormula(): string {
        return this.LeftNumber.toString()
            + ' + ' + this.RightNumber.toString() + ' = ' + this.Result.toString();
    }

    public getInputtedForumla(): string {
        return this.LeftNumber.toString()
            + ' + ' + this.RightNumber.toString() + ' = '
            + ((this.InputtedResult !== undefined && this.InputtedResult !== null) ? this.InputtedResult.toString() : '');
    }

    public getQuizFormat(): string {
        const rststr = super.getQuizFormat();
        return rststr + this.LeftNumber.toString()
            + ' + ' + this.RightNumber.toString() + ' = ';
    }

    protected storeToJsonObject(): any {
        const jobj = super.storeToJsonObject();
        return jobj;
    }

    protected restoreFromJsonObject(jobj: any): void {
        super.restoreFromJsonObject(jobj);
    }

    protected calcResult(): void {
        super.calcResult();

        this._result = this.LeftNumber + this.RightNumber;
        if (this._decimalPlaces === 0) {
            this._result = Math.round(this._result);
        } else {
            this._result = parseFloat(this._result.toFixed(this._decimalPlaces));
        }
    }
}

/**
 * Math quiz item for subtraction part
 */
export class SubtractionQuizItem extends PrimarySchoolMathFAOQuizItem {
    private _result!: number;
    private _inputtedResult!: number;

    get Result(): number {
        return this._result;
    }
    get InputtedResult(): number {
        return this._inputtedResult;
    }
    set InputtedResult(ir: number) {
        this._inputtedResult = ir;
    }

    public IsCorrect(): boolean {
        if (!super.IsCorrect()) {
            return false;
        }

        if (this._inputtedResult === null || this._inputtedResult === undefined) {
            return false;
        }

        if (this._inputtedResult === this._result) {
            return true;
        }

        return false;
    }

    constructor(lft?: number, right?: number, dplace?: number) {
        super(lft, right, dplace);
    }

    public getCorrectFormula(): string {
        return this.LeftNumber.toString()
            + ' - ' + this.RightNumber.toString() + ' = ' + this.Result.toString();
    }

    public getInputtedForumla(): string {
        return this.LeftNumber.toString()
            + ' - ' + this.RightNumber.toString() + ' = '
            + ((this.InputtedResult !== undefined && this.InputtedResult !== null) ? this.InputtedResult.toString() : '');
    }

    public getQuizFormat(): string {
        const rststr = super.getQuizFormat();
        return rststr + this.LeftNumber.toString()
            + ' - ' + this.RightNumber.toString() + ' = ';
    }

    protected storeToJsonObject(): any {
        const jobj = super.storeToJsonObject();
        return jobj;
    }

    protected restoreFromJsonObject(jobj: any): void {
        super.restoreFromJsonObject(jobj);
    }

    protected calcResult(): void {
        super.calcResult();

        this._result = this.LeftNumber - this.RightNumber;
        if (this._decimalPlaces === 0) {
            this._result = Math.round(this._result);
        } else {
            this._result = parseFloat(this._result.toFixed(this._decimalPlaces));
        }
    }
}

/**
 * Math quiz item for multiplication part
 */
export class MultiplicationQuizItem extends PrimarySchoolMathFAOQuizItem {
    private _result!: number;
    private _inputtedResult!: number;

    get Result(): number {
        return this._result;
    }
    get InputtedResult(): number {
        return this._inputtedResult;
    }
    set InputtedResult(ir: number) {
        this._inputtedResult = ir;
    }

    public IsCorrect(): boolean {
        if (!super.IsCorrect()) {
            return false;
        }

        if (this._inputtedResult === null || this._inputtedResult === undefined) {
            return false;
        }

        if (this._inputtedResult === this._result) {
            return true;
        }

        return false;
    }

    constructor(lft?: number, right?: number, dplace?: number) {
        super(lft, right, dplace);
    }

    public getCorrectFormula(): string {
        return this.LeftNumber.toString()
            + ' × ' + this.RightNumber.toString() + ' = '
            + this.Result.toString();
    }

    public getInputtedForumla(): string {
        return this.LeftNumber.toString()
            + ' × ' + this.RightNumber.toString() + ' = '
            + ((this.InputtedResult !== undefined && this.InputtedResult !== null) ? this.InputtedResult.toString() : '');
    }

    public getQuizFormat(): string {
        const rststr = super.getQuizFormat();
        return rststr + this.LeftNumber.toString()
            + ' × ' + this.RightNumber.toString() + ' = ';
    }

    protected storeToJsonObject(): any {
        const jobj = super.storeToJsonObject();
        return jobj;
    }

    protected restoreFromJsonObject(jobj: any): void {
        super.restoreFromJsonObject(jobj);
    }

    protected calcResult(): void {
        super.calcResult();

        this._result = this.LeftNumber * this.RightNumber;
        if (this._decimalPlaces === 0) {
            this._result = Math.round(this._result);
        } else {
            this._result = parseFloat(this._result.toFixed(this._decimalPlaces));
        }
    }
}

/**
 * Math quiz item for division  part
 */
export class DivisionQuizItem extends PrimarySchoolMathFAOQuizItem {
    private _quotient!: number;
    private _remainder!: number;
    private _inputtedQuotient!: number;
    private _inputtedRemainder!: number;

    get Dividend(): number {
        return this.LeftNumber;
    }
    get Divisor(): number {
        return this.RightNumber;
    }

    get Quotient(): number {
        return this._quotient;
    }
    get Remainder(): number {
        return this._remainder;
    }
    get InputtedQuotient(): number {
        return this._inputtedQuotient;
    }
    set InputtedQuotient(ir: number) {
        this._inputtedQuotient = ir;
    }
    get InputtedRemainder(): number {
        return this._inputtedRemainder;
    }
    set InputtedRemainder(ir: number) {
        this._inputtedRemainder = ir;
    }

    constructor(lft?: number, right?: number, dplace?: number) {
        super(lft, right, dplace);
    }

    public IsCorrect(): boolean {
        const brst = super.IsCorrect();
        if (!brst) {
            return brst;
        }

        if (this._inputtedQuotient === null || this._inputtedQuotient === undefined
            || this._inputtedRemainder === null || this._inputtedRemainder === null) {
            return false;
        }

        if (this._inputtedQuotient === this._quotient && this._inputtedRemainder === this._remainder) {
            return true;
        }

        return false;
    }

    public getCorrectFormula(): string {
        return this.LeftNumber.toString()
            + ' ÷ ' + this.RightNumber.toString() + ' = ' + this.Quotient.toString()
            + ((this.Remainder === 0) ? '' : ('... ' + this.Remainder.toString()));
    }

    public getInputtedForumla(): string {
        return this.LeftNumber.toString()
            + ' ÷ ' + this.RightNumber.toString() + ' = '
            + ((this.InputtedQuotient !== undefined && this.InputtedQuotient !== null) ? this.InputtedQuotient.toString() : '')
            + ((this.InputtedRemainder !== undefined && this.InputtedRemainder !== null) ? ' ... ' + this.InputtedRemainder.toString() : '');
    }

    public getQuizFormat(): string {
        const rststr = super.getQuizFormat();
        return rststr + this.LeftNumber.toString()
            + ' ÷ ' + this.RightNumber.toString() + ' = ';
    }

    protected storeToJsonObject(): any {
        const jobj = super.storeToJsonObject();
        return jobj;
    }

    protected restoreFromJsonObject(jobj: any): void {
        super.restoreFromJsonObject(jobj);
    }

    protected canCalcResult(): boolean {
        if (!super.canCalcResult()) {
            return false;
        }

        if (this._rightNumber === 0) {
            return false;
        }

        return true;
    }

    protected calcResult(): void {
        super.calcResult();

        this._quotient = this.LeftNumber / this.RightNumber;
        this._remainder = this.LeftNumber % this.RightNumber;
        if (this._decimalPlaces > 0) {
            this._quotient = parseFloat(this._quotient.toFixed(this._decimalPlaces));
        } else {
            this._quotient = Math.floor(this._quotient);
        }
    }
}
