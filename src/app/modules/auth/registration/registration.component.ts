import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable, Subject, Subscription} from 'rxjs';
import {AuthService} from '../_services/auth.service';
import {Router} from '@angular/router';
import {UserModel} from '../_models/user.model';
import {first} from 'rxjs/operators';
import {CustomValidators} from "./custom-validators";
import {ISignUpResult} from "amazon-cognito-identity-js";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit, OnDestroy {
  registrationForm: FormGroup;
  hasError: boolean;
  isLoading$: Subject<boolean> = new Subject();

  error: string;


  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  formRegister: FormGroup;
  showConfirmPage: boolean;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.formRegister = this.createSignupForm();
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registrationForm.controls;
  }

  createSignupForm(): FormGroup {
    return this.fb.group(
        {
          email: [
            null,
            Validators.required
          ],
          agree: [false, Validators.compose([Validators.required])],
          password: [
            null,
            Validators.compose([
              Validators.required,
              // check whether the entered password has a number
              CustomValidators.patternValidator(/\d/, {
                hasNumber: true
              }),
              // check whether the entered password has upper case letter
              CustomValidators.patternValidator(/[A-Z]/, {
                hasCapitalCase: true
              }),
              // check whether the entered password has a lower case letter
              CustomValidators.patternValidator(/[a-z]/, {
                hasSmallCase: true
              }),
              // check whether the entered password has a special character
              CustomValidators.patternValidator(
                  /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
                  {
                    hasSpecialCharacters: true
                  }
              ),
              Validators.minLength(8)
            ])
          ],
          confirmPassword: [null, Validators.compose([Validators.required])]
        },
        {
          // check whether our password and confirm password match
          validator: CustomValidators.passwordMatchValidator
        }
    );
  }

  signUp() {
    this.error = null;
    this.isLoading$.next(true);
    this.authService.signup(
        this.formRegister.controls.email.value,
        this.formRegister.controls.password.value).subscribe((result: ISignUpResult) => {
      this.isLoading$.next(false);
      if (!result.userConfirmed) {
        this.showConfirmPage = true;
      } else {
        this.router.navigateByUrl('login');
      }
    }, reason => {
      this.error = reason.code + ' - ' + reason.message;
      console.error(reason);
      this.isLoading$.next(false);
    });
  }

  submit() {
    this.hasError = false;
    const result = {};
    Object.keys(this.f).forEach(key => {
      result[key] = this.f[key].value;
    });
    const newUser = new UserModel();
    newUser.setUser(result);
    const registrationSubscr = this.authService
      .registration(newUser)
      .pipe(first())
      .subscribe((user: UserModel) => {
        if (user) {
          this.router.navigate(['/']);
        } else {
          this.hasError = true;
        }
      });
    this.unsubscribe.push(registrationSubscr);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
