
import {Component , View , CoreDirectives} from 'angular/angular2';
import {RouteConfig , RouterOutlet , RouterLink , Router} from 'angular2/router';

@Component({
	selector: '<%= selector %>'
})

@View({
	directives: [ RouterOutlet , RouterLink , coreDirectives],
	template: `
		<div></div>
	`
})

export class App {
	title: string,
	constructor() {
		this.title = 'Angular 2 <%= cameledName %>'
	}
}
